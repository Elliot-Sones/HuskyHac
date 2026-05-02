type Props = {
  visible: boolean;
  message: string;
};

export function Toast({ visible, message }: Props) {
  return (
    <div
      className={`toast-anim ${visible ? 'show' : ''} fixed top-32 left-1/2 -translate-x-1/2 z-30 glass rounded-full ring-soft px-4 py-2 text-[13px] text-slate-700`}
    >
      {message}
    </div>
  );
}
