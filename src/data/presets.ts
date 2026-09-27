export interface TextPreset {
  id: string;
  category: string;
  title: string;
  text: string;
  recommendedVoice: string;
  recommendedStyle: string;
  recommendedAccent: string;
}

export const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'berita-malaysia',
    category: 'Berita & Hebahan',
    title: 'Warta Berita Malaysia',
    text: 'Selamat petang para pendengar. <breath> Perkembangan teknologi kecerdasan buatan kini membuka lembaran baharu di Malaysia. Inisiatif ekonomi digital negara terus berkembang pesat, membolehkan pelbagai sektor memanfaatkan teknologi canggih ini untuk kemudahan rakyat.',
    recommendedVoice: 'Kore',
    recommendedStyle: 'Penyampai berita televisyen Malaysia (sebutan baku formal, intonasi tenang, jelas dan berwibawa)',
    recommendedAccent: 'malay-berita',
  },
  {
    id: 'santai-harian',
    category: 'Sembang Santai',
    title: 'Sembang Lepak Kedai Mamak',
    text: 'Jom kita pekena teh tarik petang ni! Dah lama tak lepak borak-borak santai. Awak nak minum apa? Roti canai garing satu, teh tarik kurang manis satu, mantap betul!',
    recommendedVoice: 'Puck',
    recommendedStyle: 'Pemuda Malaysia berbual santai, mesra, loghat perbualan harian Kuala Lumpur',
    recommendedAccent: 'malay-santai',
  },
  {
    id: 'kisah-dongeng',
    category: 'Kisah & Sastera',
    title: 'Hikayat Gunung Ledang',
    text: 'Alkisah pada zaman dahulu kala, di puncak Gunung Ledang yang diselimuti kabus putih tebal, <breath> bersemayam seorang puteri yang terkenal dengan kecantikan budi bahasa dan kebijaksanaannya. Angin malam berbisik lembut, membawa khabar tentang keindahan alam nusantara.',
    recommendedVoice: 'Charon',
    recommendedStyle: 'Pencerita hikayat Melayu klasik, suara dalam, berirama lunak dan syahdu',
    recommendedAccent: 'malay-standard',
  },
  {
    id: 'iklan-kreatif',
    category: 'Iklan & Promosi',
    title: 'Promosi Kopi Kampung Melaka',
    text: 'Mulakan pagi anda dengan aroma memikat kopi kampung asli warisan Melaka! Dipanggang sempurna dengan rasa karamel yang pekat dan berlemak. Sekali hirup, pasti nak lagi! Dapatkan promosi istimewa ini di kedai berhampiran anda hari ini!',
    recommendedVoice: 'Puck',
    recommendedStyle: 'Ceria, bertenaga, promosi iklan radio Malaysia yang rancak dan persuasif',
    recommendedAccent: 'malay-santai',
  },
  {
    id: 'ucapan-rasmi',
    category: 'Pengumuman Awam',
    title: 'Pesanan Keselamatan Jalan Raya',
    text: 'Perhatian kepada semua pemandu. Pandu dengan cermat dan patuhi had laju yang telah ditetapkan. Ingatlah insan tersayang yang sedang menanti kepulangan anda dengan selamat di rumah. Pandu cermat, jiwa selamat.',
    recommendedVoice: 'Fenrir',
    recommendedStyle: 'Pengumuman khidmat masyarakat rasmi, suara tegas, mantap dan meyakinkan',
    recommendedAccent: 'malay-berita',
  },
  {
    id: 'tenang-mindfulness',
    category: 'Ketenangan Jiwa',
    title: 'Panduan Relaksasi Minda',
    text: 'Tarik nafas dalam-dalam perlahan-lahan... <breath> rasakan udara nyaman memenuhi dada anda... tahan seketika... dan hembuskan perlahan-lahan. Lepaskan segala beban fikiran seharian. Semoga hati anda kembali tenang dan damai.',
    recommendedVoice: 'Zephyr',
    recommendedStyle: 'Lemah lembut, berbisik tenang, tempo perlahan membawa ketenangan jiwa',
    recommendedAccent: 'malay-standard',
  },
];

export const ACCENT_PRESETS = [
  {
    id: 'malay-standard',
    name: 'Baku Rasmi Malaysia',
    description: 'Sebutan baku rasmi Bahasa Melayu standard (sekolah & pengumuman korporat).',
  },
  {
    id: 'malay-santai',
    name: 'Loghat Santai Harian',
    description: 'Percakapan mesra harian orang Malaysia (gaya sembang lepak & vlogging).',
  },
  {
    id: 'malay-berita',
    name: 'Penyampai Berita (RTM/TV3)',
    description: 'Artikulasi tegas, kemas, dan profesional gaya wartawan penyiaran.',
  },
  {
    id: 'malay-kl',
    name: 'Bandar Moden (KL / Lembah Klang)',
    description: 'Nada perbualan belia moden bandaraya Kuala Lumpur yang dinamik.',
  },
];

export const STYLE_PRESETS = [
  {
    id: 'melayu-asli',
    name: 'Melayu Malaysia Asli',
    prompt: 'Native Malaysian Malay speaker, natural intonation, authentic Malaysian cadence and clear pronunciation',
  },
  {
    id: 'pembaca-berita',
    name: 'Penyampai Berita TV',
    prompt: 'Professional Malaysian broadcast news anchor, authoritative, clear diction, fluent standard Bahasa Melayu',
  },
  {
    id: 'mesra-pelanggan',
    name: 'Sopan & Khidmat Pelanggan',
    prompt: 'Polite, warm and friendly Malaysian customer service representative, helpful and gentle tone',
  },
  {
    id: 'pencerita-sastera',
    name: 'Pencerita & Narator Kisah',
    prompt: 'Expressive Malaysian audiobook storyteller, atmospheric pacing, emotive pauses and dramatic depth',
  },
  {
    id: 'ceria-radio',
    name: 'DJ Radio Ceria (Era / Sinar)',
    prompt: 'Enthusiastic Malaysian radio DJ host, upbeat banter, energetic and infectious good vibes',
  },
  {
    id: 'tenang-santai',
    name: 'Tenang & Perlahan',
    prompt: 'Soft, calm, soothing Malaysian voice, gentle breathing and peaceful rhythm',
  },
];

export const VOCAL_EFFECTS = [
  { tag: '<breath>', label: 'Tarik Nafas (<breath>)', desc: 'Jeda hembusan nafas semula jadi' },
  { tag: '<laugh>', label: 'Ketawa (<laugh>)', desc: 'Bunyi tawa kecil spontan' },
  { tag: '<gasp>', label: 'Terkejut (<gasp>)', desc: 'Ekspresi kagum atau terperanjat' },
  { tag: '<sigh>', label: 'Keluhan (<sigh>)', desc: 'Helaan nafas lega atau penat' },
  { tag: '|yeah|', label: 'Setuju (|yeah|)', desc: 'Pengesahan santai' },
  { tag: '|mhm|', label: 'Mengiyakan (|mhm|)', desc: 'Backchanneling ya/betul' },
];

export const DIALOGUE_PRESETS = [
  {
    id: 'podcast-malaysia',
    title: 'Podcast: Borak Teknologi Malaysia',
    speaker1: { name: 'Danial', voice: 'Puck', style: 'Host podcast muda Malaysia, ceria, bertenaga dan santai' },
    speaker2: { name: 'Aisyah', voice: 'Kore', style: 'Pakar teknologi tempatan, sopan, bernas dan ramah' },
    turns: [
      {
        speaker: 'Danial',
        text: 'Hai assalamualaikum semua! <breath> Selamat kembali ke Podcast Borak Tech Malaysia bersama saya Danial dan tetamu kita Aisyah.',
      },
      {
        speaker: 'Aisyah',
        text: 'Waalaikumussalam Danial. Terima kasih jemput saya. Seronok dapat kongsikan cerita pasal teknologi suara hari ini.',
      },
      {
        speaker: 'Danial',
        text: 'Aisyah, sekarang teknologi Text to Speech Google dah pandai sebut loghat orang Melayu Malaysia kan? Siap ada gaya intonasi lagi!',
      },
      {
        speaker: 'Aisyah',
        text: 'Betul sangat tu Danial! |yeah| Dengar macam orang kita sendiri yang tengah bercakap di sebelah.',
      },
    ],
  },
  {
    id: 'kedai-kopi',
    title: 'Santai di Restoran Mamak',
    speaker1: { name: 'Hafiz', voice: 'Fenrir', style: 'Sahabat akrab lelaki, bersahaja dan ramah' },
    speaker2: { name: 'Nadia', voice: 'Zephyr', style: 'Gadis ceria, lemah lembut dan mesra' },
    turns: [
      {
        speaker: 'Hafiz',
        text: 'Nadia, makanan awak dah sampai ni. Panas-panas lagi mi goreng mamak ni.',
      },
      {
        speaker: 'Nadia',
        text: 'Wah, terima kasih Hafiz! <sigh> Lapar betul rasa lepas habis kerja seharian tadi.',
      },
      {
        speaker: 'Hafiz',
        text: 'Haha, sama-sama! <laugh> Makan kenyang-kenyang dulu, nanti kita sambung sembang.',
      },
    ],
  },
];
