import type { LearningLanguage, ResponseOption, Scenario, TranscriptLine } from '@/shared/contracts';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_PROFILES,
  resolveLanguageProfile,
  type KnownLanguageName,
} from '@/scenarios/languageProfiles';

interface CountryProfile {
  country: string;
  city: string;
  airport: string;
  language: LearningLanguage;
}

interface PhrasePack {
  greeting: string;
  askTrain: string;
  askCenter: string;
  askTaxi: string;
  transport: string;
  confirmStation: string;
  askTicket: string;
  askCard: string;
  ticket: string;
  thanks: string;
  repeat: string;
  close: string;
}

const CITY_OVERRIDES: Record<string, string> = {
  Brazil: 'Rio de Janeiro',
  China: 'Beijing',
  Egypt: 'Cairo',
  France: 'Paris',
  Germany: 'Berlin',
  Greece: 'Athens',
  India: 'Delhi',
  Italy: 'Rome',
  Japan: 'Tokyo',
  Mexico: 'Mexico City',
  Netherlands: 'Amsterdam',
  Portugal: 'Lisbon',
  Russia: 'Moscow',
  Spain: 'Madrid',
  'South Korea': 'Seoul',
  Turkey: 'Istanbul',
  'United Kingdom': 'London',
  'United States of America': 'New York',
};

const COUNTRY_LANGUAGES: Record<string, KnownLanguageName> = {
  Algeria: 'Arabic',
  Argentina: 'Spanish',
  Australia: 'English',
  Austria: 'German',
  Belgium: 'French',
  Brazil: 'Portuguese',
  Canada: 'English',
  Chile: 'Spanish',
  China: 'Mandarin',
  Colombia: 'Spanish',
  Cuba: 'Spanish',
  Egypt: 'Arabic',
  France: 'French',
  Germany: 'German',
  Greece: 'Greek',
  India: 'Hindi',
  Ireland: 'English',
  Italy: 'Italian',
  Japan: 'Japanese',
  Mexico: 'Spanish',
  Morocco: 'Arabic',
  Netherlands: 'Dutch',
  'New Zealand': 'English',
  Portugal: 'Portuguese',
  Russia: 'Russian',
  Spain: 'Spanish',
  'South Africa': 'English',
  'South Korea': 'Korean',
  Turkey: 'Turkish',
  'United Kingdom': 'English',
  'United States of America': 'English',
};

const PHRASES: Record<KnownLanguageName, PhrasePack> = {
  Arabic: {
    greeting: 'مرحبا! أهلا بك. كيف أستطيع مساعدتك؟',
    askTrain: 'مرحبا، أبحث عن القطار.',
    askCenter: 'مرحبا، كيف أذهب إلى وسط المدينة؟',
    askTaxi: 'عفوا، أين أجد سيارة أجرة؟',
    transport: 'القطار هو الأسرع. اتبع اللوحات إلى المحطة.',
    confirmStation: 'شكرا. هل المحطة من هنا؟',
    askTicket: 'أين أستطيع شراء تذكرة؟',
    askCard: 'هل أستطيع الدفع بالبطاقة؟',
    ticket: 'نعم، آلات التذاكر على اليسار.',
    thanks: 'شكرا جزيلا.',
    repeat: 'هل يمكنك أن تكرر ببطء؟',
    close: 'ممتاز، شكرا على مساعدتك.',
  },
  Dutch: {
    greeting: 'Hallo! Welkom. Hoe kan ik u helpen?',
    askTrain: 'Hallo, ik zoek de trein.',
    askCenter: 'Hallo, hoe kom ik in het centrum?',
    askTaxi: 'Pardon, waar kan ik een taxi nemen?',
    transport: 'De trein is het snelst. Volg de borden naar het station.',
    confirmStation: 'Dank u. Is het station deze kant op?',
    askTicket: 'Waar kan ik een kaartje kopen?',
    askCard: 'Kan ik met kaart betalen?',
    ticket: 'Ja, de automaten staan links.',
    thanks: 'Heel erg bedankt.',
    repeat: 'Kunt u dat langzamer herhalen?',
    close: 'Perfect, bedankt voor uw hulp.',
  },
  English: {
    greeting: 'Hello! Welcome. How can I help you?',
    askTrain: 'Hello, I am looking for the train.',
    askCenter: 'Hello, how can I get to the city center?',
    askTaxi: 'Excuse me, where can I take a taxi?',
    transport: 'The train is the fastest. Follow the signs toward the station.',
    confirmStation: 'Thanks. Is the station this way?',
    askTicket: 'Where can I buy a ticket?',
    askCard: 'Can I pay by card?',
    ticket: 'Yes, the ticket machines are on the left.',
    thanks: 'Thank you very much.',
    repeat: 'Can you repeat more slowly?',
    close: 'Perfect, thank you for your help.',
  },
  French: {
    greeting: 'Bonjour ! Bienvenue. Comment puis-je vous aider ?',
    askTrain: 'Bonjour, je cherche le train.',
    askCenter: 'Bonjour, comment puis-je aller au centre-ville ?',
    askTaxi: 'Excusez-moi, ou prend-on un taxi ?',
    transport: 'Le train est le plus rapide. Suivez les panneaux vers la gare.',
    confirmStation: 'Merci. La gare est par la ?',
    askTicket: 'Ou puis-je acheter un billet ?',
    askCard: 'Est-ce que je peux payer par carte ?',
    ticket: 'Oui, les distributeurs sont juste a gauche.',
    thanks: 'Merci beaucoup.',
    repeat: 'Pouvez-vous repeter plus lentement ?',
    close: 'Parfait, merci pour votre aide.',
  },
  German: {
    greeting: 'Hallo! Willkommen. Wie kann ich Ihnen helfen?',
    askTrain: 'Hallo, ich suche den Zug.',
    askCenter: 'Hallo, wie komme ich ins Stadtzentrum?',
    askTaxi: 'Entschuldigung, wo nehme ich ein Taxi?',
    transport: 'Der Zug ist am schnellsten. Folgen Sie den Schildern zum Bahnhof.',
    confirmStation: 'Danke. Ist der Bahnhof dort?',
    askTicket: 'Wo kann ich ein Ticket kaufen?',
    askCard: 'Kann ich mit Karte bezahlen?',
    ticket: 'Ja, die Automaten sind links.',
    thanks: 'Vielen Dank.',
    repeat: 'Konnen Sie das langsamer wiederholen?',
    close: 'Perfekt, danke fur Ihre Hilfe.',
  },
  Greek: {
    greeting: 'Γεια σας! Καλώς ήρθατε. Πώς μπορώ να σας βοηθήσω;',
    askTrain: 'Γεια σας, ψάχνω το τρένο.',
    askCenter: 'Γεια σας, πώς πάω στο κέντρο;',
    askTaxi: 'Συγγνώμη, πού παίρνω ταξί;',
    transport: 'Το τρένο είναι το πιο γρήγορο. Ακολουθήστε τις πινακίδες.',
    confirmStation: 'Ευχαριστώ. Είναι ο σταθμός από εδώ;',
    askTicket: 'Πού μπορώ να αγοράσω εισιτήριο;',
    askCard: 'Μπορώ να πληρώσω με κάρτα;',
    ticket: 'Ναι, τα μηχανήματα είναι αριστερά.',
    thanks: 'Ευχαριστώ πολύ.',
    repeat: 'Μπορείτε να το επαναλάβετε πιο αργά;',
    close: 'Τέλεια, ευχαριστώ για τη βοήθεια.',
  },
  Hindi: {
    greeting: 'नमस्ते! आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ?',
    askTrain: 'नमस्ते, मैं ट्रेन ढूंढ रहा हूँ।',
    askCenter: 'नमस्ते, मैं शहर के केंद्र कैसे जाऊँ?',
    askTaxi: 'माफ कीजिए, टैक्सी कहाँ मिलेगी?',
    transport: 'ट्रेन सबसे तेज है। स्टेशन के संकेतों का पालन करें।',
    confirmStation: 'धन्यवाद। क्या स्टेशन इस तरफ है?',
    askTicket: 'मैं टिकट कहाँ खरीद सकता हूँ?',
    askCard: 'क्या मैं कार्ड से भुगतान कर सकता हूँ?',
    ticket: 'हाँ, टिकट मशीनें बाईं ओर हैं।',
    thanks: 'बहुत धन्यवाद।',
    repeat: 'क्या आप धीरे-धीरे दोहरा सकते हैं?',
    close: 'बहुत अच्छा, मदद के लिए धन्यवाद।',
  },
  Italian: {
    greeting: 'Buongiorno! Benvenuto. Come posso aiutarla?',
    askTrain: 'Buongiorno, cerco il treno.',
    askCenter: 'Buongiorno, come posso andare in centro?',
    askTaxi: 'Scusi, dove posso prendere un taxi?',
    transport: 'Il treno e il piu veloce. Segua i cartelli per la stazione.',
    confirmStation: 'Grazie. La stazione e da questa parte?',
    askTicket: 'Dove posso comprare un biglietto?',
    askCard: 'Posso pagare con carta?',
    ticket: 'Si, le macchine dei biglietti sono a sinistra.',
    thanks: 'Grazie mille.',
    repeat: 'Puo ripetere piu lentamente?',
    close: 'Perfetto, grazie per l aiuto.',
  },
  Japanese: {
    greeting: 'こんにちは！ようこそ。どのようにお手伝いできますか？',
    askTrain: 'こんにちは、電車を探しています。',
    askCenter: 'こんにちは、市内中心部へはどう行けばいいですか？',
    askTaxi: 'すみません、タクシーはどこで乗れますか？',
    transport: '電車が一番早いです。駅への標識に従ってください。',
    confirmStation: 'ありがとうございます。駅はこちらですか？',
    askTicket: '切符はどこで買えますか？',
    askCard: 'カードで払えますか？',
    ticket: 'はい、券売機は左側にあります。',
    thanks: 'ありがとうございます。',
    repeat: 'もう少しゆっくり繰り返してもらえますか？',
    close: '完璧です。助けてくれてありがとうございます。',
  },
  Korean: {
    greeting: '안녕하세요! 환영합니다. 무엇을 도와드릴까요?',
    askTrain: '안녕하세요, 기차를 찾고 있어요.',
    askCenter: '안녕하세요, 시내 중심으로 어떻게 가나요?',
    askTaxi: '실례합니다, 택시는 어디서 타나요?',
    transport: '기차가 가장 빠릅니다. 역 표지판을 따라가세요.',
    confirmStation: '감사합니다. 역은 이쪽인가요?',
    askTicket: '표는 어디에서 살 수 있나요?',
    askCard: '카드로 결제할 수 있나요?',
    ticket: '네, 매표기는 왼쪽에 있습니다.',
    thanks: '정말 감사합니다.',
    repeat: '좀 더 천천히 반복해 주시겠어요?',
    close: '좋습니다, 도와주셔서 감사합니다.',
  },
  Mandarin: {
    greeting: '你好！欢迎。有什么可以帮您？',
    askTrain: '你好，我在找火车。',
    askCenter: '你好，请问怎么去市中心？',
    askTaxi: '不好意思，在哪里可以打出租车？',
    transport: '火车最快。请跟着去车站的指示牌走。',
    confirmStation: '谢谢。车站在这边吗？',
    askTicket: '我在哪里买票？',
    askCard: '可以刷卡付款吗？',
    ticket: '可以，售票机在左边。',
    thanks: '非常感谢。',
    repeat: '您可以说慢一点吗？',
    close: '太好了，谢谢您的帮助。',
  },
  Portuguese: {
    greeting: 'Ola! Bem-vindo. Como posso ajudar?',
    askTrain: 'Ola, estou procurando o trem.',
    askCenter: 'Ola, como chego ao centro?',
    askTaxi: 'Com licenca, onde posso pegar um taxi?',
    transport: 'O trem e o mais rapido. Siga as placas para a estacao.',
    confirmStation: 'Obrigado. A estacao fica por aqui?',
    askTicket: 'Onde posso comprar uma passagem?',
    askCard: 'Posso pagar com cartao?',
    ticket: 'Sim, as maquinas de bilhetes estao a esquerda.',
    thanks: 'Muito obrigado.',
    repeat: 'Pode repetir mais devagar?',
    close: 'Perfeito, obrigado pela ajuda.',
  },
  Russian: {
    greeting: 'Здравствуйте! Добро пожаловать. Чем я могу помочь?',
    askTrain: 'Здравствуйте, я ищу поезд.',
    askCenter: 'Здравствуйте, как мне добраться до центра города?',
    askTaxi: 'Извините, где можно взять такси?',
    transport: 'Поезд самый быстрый. Следуйте указателям к станции.',
    confirmStation: 'Спасибо. Станция в этой стороне?',
    askTicket: 'Где я могу купить билет?',
    askCard: 'Можно оплатить картой?',
    ticket: 'Да, билетные автоматы слева.',
    thanks: 'Большое спасибо.',
    repeat: 'Можете повторить медленнее?',
    close: 'Отлично, спасибо за помощь.',
  },
  Spanish: {
    greeting: 'Hola! Bienvenido. Como puedo ayudarle?',
    askTrain: 'Hola, busco el tren.',
    askCenter: 'Hola, como puedo ir al centro?',
    askTaxi: 'Disculpe, donde puedo tomar un taxi?',
    transport: 'El tren es el mas rapido. Siga los carteles hacia la estacion.',
    confirmStation: 'Gracias. La estacion esta por alli?',
    askTicket: 'Donde puedo comprar un billete?',
    askCard: 'Puedo pagar con tarjeta?',
    ticket: 'Si, las maquinas de billetes estan a la izquierda.',
    thanks: 'Muchas gracias.',
    repeat: 'Puede repetir mas despacio?',
    close: 'Perfecto, gracias por su ayuda.',
  },
  Turkish: {
    greeting: 'Merhaba! Hos geldiniz. Size nasil yardimci olabilirim?',
    askTrain: 'Merhaba, treni ariyorum.',
    askCenter: 'Merhaba, sehir merkezine nasil giderim?',
    askTaxi: 'Affedersiniz, taksiye nereden binebilirim?',
    transport: 'Tren en hizli yol. Istasyon tabelalarini takip edin.',
    confirmStation: 'Tesekkurler. Istasyon bu tarafta mi?',
    askTicket: 'Nereden bilet alabilirim?',
    askCard: 'Kartla odeme yapabilir miyim?',
    ticket: 'Evet, bilet makineleri solda.',
    thanks: 'Cok tesekkur ederim.',
    repeat: 'Daha yavas tekrar eder misiniz?',
    close: 'Harika, yardiminiz icin tesekkurler.',
  },
};

export function createCountryAirportScenario(countryName: string): Scenario {
  const profile = getCountryLearningProfile(countryName);
  const phrases = PHRASES[profile.language.name as KnownLanguageName] ?? PHRASES.English;
  const scenarioId = countryAirportSlug(profile.country);

  return {
    id: scenarioId,
    title: `${profile.city} arrival`,
    destination: `${profile.city}, ${profile.country}`,
    terminal: `${profile.airport} · arrivals`,
    goal: `Ask the airport agent how to reach central ${profile.city}.`,
    progress: 0,
    language: profile.language,
    personaPrompt:
      `${localNpcName(profile.language.name)} is a concise airport information-desk agent in ${profile.city}. ` +
      `They answer in short ${profile.language.name}, repeat key transport words, and keep the learner focused on reaching the city center.`,
    completionCriteria: [
      `Learner asks for transport or directions to central ${profile.city}.`,
      'Learner understands train, taxi, station, ticket, or payment guidance.',
      'Learner closes politely or asks for clarification.',
    ],
    backboard: {
      memoryMode: 'Auto',
    },
    npc: {
      id: `airport-agent-${slugify(profile.country)}`,
      name: localNpcName(profile.language.name),
      role: 'Airport information agent',
      locationLabel: 'Information desk · arrivals hall',
      language: profile.language.name,
      cefrLevel: 'A2',
    },
    turns: [
      {
        id: 'greeting',
        npcLine: npcLine(`${scenarioId}-npc-greeting`, phrases.greeting, 'Hello! Welcome. How can I help you?'),
        responses: [
          response('find-train', 'easy', phrases.askTrain, 'Hello, I am looking for the train.'),
          response(
            'ask-downtown',
            'natural',
            phrases.askCenter,
            'Hello, how can I get to the city center?',
            true,
          ),
          response('ask-taxi', 'challenge', phrases.askTaxi, 'Excuse me, where can I take a taxi?'),
        ],
        acceptedMeanings: ['downtown', 'center', 'centre', 'train', 'taxi', 'station'],
        goalHint: `Ask for central ${profile.city}, the train, or a taxi.`,
      },
      {
        id: 'transport-choice',
        npcLine: npcLine(
          `${scenarioId}-npc-transport`,
          phrases.transport,
          'The train is the fastest. Follow the signs toward the station.',
        ),
        responses: [
          response('confirm-station', 'easy', phrases.confirmStation, 'Thanks. Is the station this way?'),
          response('ask-ticket', 'natural', phrases.askTicket, 'Where can I buy a ticket?', true),
          response('ask-card', 'challenge', phrases.askCard, 'Can I pay by card?'),
        ],
        acceptedMeanings: ['ticket', 'station', 'card', 'machine', 'payment'],
        goalHint: 'Confirm the station or ask where to buy a ticket.',
      },
      {
        id: 'ticket-confirmation',
        npcLine: npcLine(
          `${scenarioId}-npc-ticket`,
          phrases.ticket,
          'Yes, the ticket machines are on the left.',
        ),
        responses: [
          response('thanks', 'easy', phrases.thanks, 'Thank you very much.', true),
          response('repeat', 'natural', phrases.repeat, 'Can you repeat more slowly?'),
          response('polite-close', 'challenge', phrases.close, 'Perfect, thank you for your help.'),
        ],
        acceptedMeanings: ['thanks', 'repeat', 'slowly', 'help'],
        goalHint: 'Thank the agent or ask them to repeat.',
      },
    ],
  };
}

export function getCountryLearningProfile(countryName: string): CountryProfile {
  const country = titleCountryName(countryName);
  const languageName = COUNTRY_LANGUAGES[country];
  const city = CITY_OVERRIDES[country] ?? country;
  const language = languageName ? LANGUAGE_PROFILES[languageName] : DEFAULT_LANGUAGE;

  return {
    country,
    city,
    airport: `${city} International Airport`,
    language,
  };
}

export function countryNameFromAirportSlug(slug: string): string {
  return titleCountryName(slug.replace(/^airport-/, '').replace(/-/g, ' '));
}

export function countryAirportSlug(countryName: string): string {
  return `airport-${slugify(countryName)}`;
}

function response(
  id: string,
  label: ResponseOption['label'],
  text: string,
  english: string,
  recommended = false,
): ResponseOption {
  return {
    id,
    label,
    french: text,
    english,
    recommended,
  };
}

function npcLine(id: string, text: string, translation: string): TranscriptLine {
  return {
    id,
    speaker: 'npc',
    text,
    translation,
    source: 'scripted',
  };
}

function titleCountryName(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      return lower === 'of' || lower === 'and' ? lower : lower.replace(/^./, (char) => char.toUpperCase());
    })
    .join(' ');
}

function localNpcName(languageName: string) {
  switch (resolveLanguageProfile(languageName).name) {
    case 'Arabic':
      return 'Agent Layla';
    case 'Dutch':
      return 'Agent Noor';
    case 'French':
      return 'Mme. Laurent';
    case 'German':
      return 'Agent Lukas';
    case 'Greek':
      return 'Agent Eleni';
    case 'Hindi':
      return 'Agent Priya';
    case 'Italian':
      return 'Agent Sofia';
    case 'Japanese':
      return 'Agent Tanaka';
    case 'Korean':
      return 'Agent Min';
    case 'Mandarin':
      return 'Agent Lin';
    case 'Portuguese':
      return 'Agent Ana';
    case 'Russian':
      return 'Agent Irina';
    case 'Spanish':
      return 'Agente Sofia';
    case 'Turkish':
      return 'Agent Deniz';
    default:
      return 'Airport agent Morgan';
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
