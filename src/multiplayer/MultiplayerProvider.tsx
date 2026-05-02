import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  PlayerAccessory,
  PlayerProfile,
  PlayerProfileInput,
  PlayerSnapshot,
  RoomState,
} from '@/shared/contracts';
import { RemoteSnapshotStore } from '@/multiplayer/remoteSnapshotStore';
import type { MultiplayerTransport, Unsubscribe } from '@/multiplayer/transports/MultiplayerTransport';
import { FakeMultiplayerTransport } from '@/multiplayer/transports/fakeTransport';
import { SocketIoMultiplayerTransport } from '@/multiplayer/transports/socketIoTransport';

type MultiplayerStatus = 'disabled' | 'solo' | 'connecting' | 'connected' | 'error';

interface ProfileDraft {
  displayName: string;
  color: string;
  accessory: PlayerAccessory;
}

interface MultiplayerContextValue {
  status: MultiplayerStatus;
  disabled: boolean;
  room: RoomState | null;
  self: PlayerProfile | null;
  profileDraft: ProfileDraft;
  error: string | null;
  remoteSnapshots: RemoteSnapshotStore;
  setProfileDraft: (draft: ProfileDraft) => void;
  createRoom: () => Promise<void>;
  joinRoom: (roomCode: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  publishSnapshot: (snapshot: PlayerSnapshot) => void;
}

const profileColors = ['#2563eb', '#16a34a', '#ea580c', '#9333ea'];
const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const multiplayerUrl = getConfiguredMultiplayerUrl();
  const disabled = isMultiplayerDisabled(multiplayerUrl);
  const remoteSnapshots = useMemo(() => new RemoteSnapshotStore(), []);
  const transportRef = useRef<MultiplayerTransport | null>(null);
  const unsubscribersRef = useRef<Unsubscribe[]>([]);
  const [status, setStatus] = useState<MultiplayerStatus>(disabled ? 'disabled' : 'solo');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [self, setSelf] = useState<PlayerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileDraft, setProfileDraftState] = useState<ProfileDraft>(() => loadProfileDraft());

  const setProfileDraft = useCallback((draft: ProfileDraft) => {
    const normalized = {
      ...draft,
      displayName: draft.displayName.slice(0, 24),
    };
    setProfileDraftState(normalized);
    writeLocalStorage('huskyhac.playerName', normalized.displayName);
    writeLocalStorage('huskyhac.playerColor', normalized.color);
    writeLocalStorage('huskyhac.playerAccessory', normalized.accessory);
  }, []);

  const ensureTransport = useCallback(() => {
    if (transportRef.current) return transportRef.current;

    const transport = disabled
      ? new FakeMultiplayerTransport()
      : new SocketIoMultiplayerTransport(multiplayerUrl);
    transportRef.current = transport;

    unsubscribersRef.current = [
      transport.onRoomUpdated((updatedRoom) => {
        setRoom(updatedRoom);
        const activeIds = new Set(updatedRoom.players.map((player) => player.id));
        remoteSnapshots.clearExcept(activeIds);
      }),
      transport.onPlayerSnapshot((snapshot) => {
        remoteSnapshots.upsert(snapshot);
      }),
      transport.onRoomError((roomError) => {
        setError(roomError.message);
      }),
    ];

    return transport;
  }, [disabled, multiplayerUrl, remoteSnapshots]);

  const buildProfileInput = useCallback((): PlayerProfileInput => {
    return {
      playerToken: getOrCreatePlayerToken(),
      displayName: profileDraft.displayName.trim() || 'Traveler',
      color: profileColors.includes(profileDraft.color) ? profileDraft.color : profileColors[0],
      accessory: profileDraft.accessory,
    };
  }, [profileDraft]);

  const createRoom = useCallback(async () => {
    if (disabled) return;
    setStatus('connecting');
    setError(null);
    try {
      const joined = await ensureTransport().createRoom(buildProfileInput());
      setRoom(joined.room);
      setSelf(joined.self);
      setStatus('connected');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Could not create room.');
    }
  }, [buildProfileInput, disabled, ensureTransport]);

  const joinRoom = useCallback(async (roomCode: string) => {
    if (disabled) return;
    setStatus('connecting');
    setError(null);
    try {
      const joined = await ensureTransport().joinRoom({
        roomCode,
        profile: buildProfileInput(),
      });
      setRoom(joined.room);
      setSelf(joined.self);
      setStatus('connected');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Could not join room.');
    }
  }, [buildProfileInput, disabled, ensureTransport]);

  const leaveRoom = useCallback(async () => {
    await transportRef.current?.leaveRoom();
    remoteSnapshots.clearExcept(new Set());
    setRoom(null);
    setSelf(null);
    setError(null);
    setStatus(disabled ? 'disabled' : 'solo');
  }, [disabled, remoteSnapshots]);

  const publishSnapshot = useCallback((snapshot: PlayerSnapshot) => {
    if (status !== 'connected') return;
    transportRef.current?.publishSnapshot(snapshot);
  }, [status]);

  useEffect(() => {
    return () => {
      unsubscribersRef.current.forEach((unsubscribe) => unsubscribe());
      transportRef.current?.disconnect();
    };
  }, []);

  const value = useMemo<MultiplayerContextValue>(() => ({
    status,
    disabled,
    room,
    self,
    profileDraft,
    error,
    remoteSnapshots,
    setProfileDraft,
    createRoom,
    joinRoom,
    leaveRoom,
    publishSnapshot,
  }), [
    createRoom,
    disabled,
    error,
    joinRoom,
    leaveRoom,
    profileDraft,
    publishSnapshot,
    remoteSnapshots,
    room,
    self,
    setProfileDraft,
    status,
  ]);

  return <MultiplayerContext.Provider value={value}>{children}</MultiplayerContext.Provider>;
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used inside MultiplayerProvider');
  }
  return context;
}

function loadProfileDraft(): ProfileDraft {
  const savedName = readLocalStorage('huskyhac.playerName');
  const savedColor = readLocalStorage('huskyhac.playerColor');
  const savedAccessory = readLocalStorage('huskyhac.playerAccessory') as PlayerAccessory | null;

  return {
    displayName: savedName || `Traveler ${Math.floor(Math.random() * 90 + 10)}`,
    color: savedColor && profileColors.includes(savedColor) ? savedColor : profileColors[0],
    accessory: savedAccessory ?? 'backpack',
  };
}

function getConfiguredMultiplayerUrl() {
  const url = import.meta.env.VITE_MULTIPLAYER_URL;
  return typeof url === 'string' && url.trim() ? url.trim() : undefined;
}

function isMultiplayerDisabled(multiplayerUrl?: string) {
  if (import.meta.env.VITE_MULTIPLAYER_DISABLED === '1') return true;

  return Boolean(import.meta.env.PROD && !multiplayerUrl);
}

function getOrCreatePlayerToken() {
  const existing = readSessionStorage('huskyhac.playerToken');
  if (existing) return existing;

  const token = window.crypto?.randomUUID?.() ?? `player-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  writeSessionStorage('huskyhac.playerToken', token);
  return token;
}

function readSessionStorage(key: string) {
  try {
    const storage = getSessionStorage();
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeSessionStorage(key: string, value: string) {
  try {
    getSessionStorage()?.setItem(key, value);
  } catch {
    // Browser privacy modes and test harnesses can expose storage but reject writes.
  }
}

function readLocalStorage(key: string) {
  try {
    const storage = getLocalStorage();
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string) {
  try {
    getLocalStorage()?.setItem(key, value);
  } catch {
    // Browser privacy modes and test harnesses can expose storage but reject writes.
  }
}

function getLocalStorage() {
  if (typeof window === 'undefined') return null;
  const storage = window.localStorage;
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    return null;
  }
  return storage;
}

function getSessionStorage() {
  if (typeof window === 'undefined') return null;
  const storage = window.sessionStorage;
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    return null;
  }
  return storage;
}
