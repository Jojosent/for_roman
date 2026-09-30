export interface PhotoItem {
  id: string;
  src: string;
  caption: string;
  rotation?: number;
}

export interface ActivityOption {
  id: string;
  title: string;
  icon: string;
  description: string;
  badge?: string;
}

export interface FoodOption {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface AppConfig {
  partnerName: string;
  invitationTitle: string;
  invitationSubtitle: string;
  letterGreeting: string;
  letterBody: string;
  availableDates: string[];
  availableTimes: string[];
  activities: ActivityOption[];
  foodOptions: FoodOption[];
  googleSheetsWebhook: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  adminPin: string;
  showMusicPlayer: boolean;
}

export interface DateSubmission {
  id: string;
  partnerName: string;
  selectedDate: string;
  selectedTime: string;
  selectedActivity: string;
  selectedFood: string;
  customNotes?: string;
  favoriteSong?: string;
  submittedAt: string;
  syncedToGoogle?: boolean;
  syncedToTelegram?: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  partnerName: "Моя прекрасная",
  invitationTitle: "Особенное приглашение",
  invitationSubtitle: "Этот вечер будет только для нас двоих ✨",
  letterGreeting: "Привет, солнце! ❤️",
  letterBody: "Ты делаешь каждый мой день ярче и теплее. Мне невероятно повезло встретить тебя. Я долго думал и подготовил кое-что особенное... Ответь на один маленький, но очень важный вопрос:",
  availableDates: [
    "Пятница, 4 октября",
    "Суббота, 5 октября",
    "Воскресенье, 6 октября",
    "Следующая пятница, 11 октября",
    "Следующая суббота, 12 октября"
  ],
  availableTimes: [
    "17:30",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30"
  ],
  activities: [
    {
      id: "dinner",
      title: "Романтический ужин",
      icon: "🕯️",
      description: "Уютный столик при свечах, вкусная еда и разговоры обо всем на свете",
      badge: "Классика"
    },
    {
      id: "walk_coffee",
      title: "Кофе и вечерняя прогулка",
      icon: "☕",
      description: "Горячие напитки, огни города, любимая музыка и тепло твоей руки",
      badge: "Уютно"
    },
    {
      id: "cinema",
      title: "Кино на мягких диванах",
      icon: "🎬",
      description: "Последний ряд, попкорн и фильм, который ты давно хотела посмотреть",
      badge: "Атмосферно"
    },
    {
      id: "panoramic_view",
      title: "Панорамный вид на ночной город",
      icon: "✨",
      description: "Красивая смотровая площадка, огни вечернего города и легкий ветерок",
      badge: "Романтично"
    },
    {
      id: "surprise",
      title: "Секретный сюрприз",
      icon: "🎁",
      description: "Ты просто одеваешься красиво, а весь план вечера я беру на себя!",
      badge: "Интрига"
    }
  ],
  foodOptions: [
    {
      id: "italian",
      title: "Итальянская кухня",
      icon: "🍝",
      description: "Нежная паста, хрустящая пицца и легкие десерты"
    },
    {
      id: "sushi",
      title: "Суши и роллы",
      icon: "🍣",
      description: "Филадельфия, свежий лосось и азиатские вкусности"
    },
    {
      id: "dessert_coffee",
      title: "Кофе и авторские десерты",
      icon: "🍰",
      description: "Круассаны, чизкейк, клубника и ароматный латте"
    },
    {
      id: "burgers_street",
      title: "Сочные бургеры",
      icon: "🍔",
      description: "Без всякого пафоса — просто вкусно и весело"
    },
    {
      id: "wine_tapas",
      title: "Легкие закуски и коктейли",
      icon: "🥂",
      description: "Сырная тарелка, фрукты и игристые напитки"
    }
  ],
  googleSheetsWebhook: "",
  telegramBotToken: "",
  telegramChatId: "",
  adminPin: "2024",
  showMusicPlayer: true
};
