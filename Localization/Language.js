import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

const en = {
  "Finish": "That's all for now. We will push you with new words soon.",
  "Lang": "EN",
  "Drag": "Drag the letter here!",
  "Explanation": "You need {{wordNumber}} words",
  "BonusWords": "You know {{bonusNumber}} bonus words",
  "Settings": "Settings",
  "SettingsLanguage": "Language Settings",
  "France": "French",
  "Germany": "German",
  "Italy": "Italian",
  "Spain": "Spanish",
  "Turkey": "Turkish",
  "UnitedKingdom": "English",
  "Network": "Please check your internet connection."
};

const tr = {
  "Finish": "Şimdilik bu kadar. Yakında yeni kelimeler ile sizi zorlayacağız.",
  "Lang": "TR",
  "Drag": "Harfleri Buraya Sürükle!",
  "Explanation": "{{wordNumber}} Kelime bulman gerekiyor",
  "BonusWords": "{{bonusNumber}} Bonus kelimeyi bildin",
  "Settings": "Ayarlar",
  "SettingsLanguage": "Dil Ayarları",
  "France": "Fransızca",
  "Germany": "Almanca",
  "Italy": "İtalyanca",
  "Spain": "İspanyolca",
  "Turkey": "Türkçe",
  "UnitedKingdom": "İngilizce",
  "Network": "Lütfen internet bağlantınızı kontrol edin."
};

const fr = {  
  "Finish": "C'est tout pour le moment. Nous allons bientôt vous pousser avec de nouveaux mots.",
  "Lang": "FR",
  "Drag": "Faites glisser la lettre ici!",
  "Explanation": "Vous avez besoin de {{wordNumber}} mots",
  "BonusWords": "Vous connaissez {{bonusNumber}} mots bonus",
  "Settings": "Réglages",
  "SettingsLanguage": "Paramètres de langue",
  "France": "Française",
  "Germany": "Allemande",
  "Italy": "Italienne",
  "Spain": "Espanol",
  "Turkey": "Turque",
  "UnitedKingdom": "Anglaise",
  "Network": "S'il vous plaît vérifier votre connexion Internet"
};

const es = {
  "Finish": "Eso es todo por ahora. Te empujaremos con nuevas palabras pronto.",
  "Lang": "ES",
  "Drag": "Arrastra la letra aquí!",
  "Explanation": "Necesitas {{wordNumber}} palabras",
  "BonusWords": " Ya sabes {{bonusNumber}} palabras extra",
  "Settings": "Ajustes",
  "SettingsLanguage": "Configuraciones de idioma",
  "France": "Francesa",
  "Germany": "Alemana",
  "Italy": "Italiana",
  "Spain": "Española",
  "Turkey": "Turca",
  "UnitedKingdom": "Inglesa",
  "Network": "Por favor revise su conexión a internet"
};

const it = {
  "Finish": "È tutto per ora. Ti spingeremo presto con nuove parole.",
  "Lang": "IT",
  "Drag": "Trascina qui la lettera!",
  "Explanation": "Hai bisogno di {{wordNumber}} parole",
  "BonusWords": " Conosci {{bonusNumber}} parole bonus",
  "Settings": "impostazioni",
  "SettingsLanguage": "Impostazioni della lingua",
  "France": "Francese",
  "Germany": "Tedesca",
  "Italy": "Italiana",
  "Spain": "Spagnola",
  "Turkey": "Turca",
  "UnitedKingdom": "Inglese",
  "Network": "Per favore controlla la tua connessione internet"
};

const de = {
  "Finish": "Das ist alles für jetzt. Wir werden Sie in Kürze mit neuen Worten unterstützen.",
  "Lang": "DE",
  "Drag": "Zieh den Brief hierher!",
  "Explanation": "Du brauchst {{wordNumber}} Wörter",
  "BonusWords": "Sie kennen {{bonusNumber}} Bonuswörter",
  "Settings": "Einstellungen",
  "SettingsLanguage": "Spracheinstellungen",
  "France": "Französisch",
  "Germany": "Deutsche",
  "Italy": "Italienisch",
  "Spain": "Spanisch",
  "Turkey": "Türkisch",
  "UnitedKingdom": "Englisch",
  "Network": "Bitte überprüfen Sie Ihre Internetverbindung"
};


i18n.fallbacks = true;
i18n.translations = { en, tr, fr, es, de, it };
i18n.locale = Localization.locale;

export default i18n;