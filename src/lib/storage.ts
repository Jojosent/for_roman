import fs from 'fs';
import path from 'path';
import { AppConfig, DateSubmission, DEFAULT_CONFIG } from './types';

// Storage paths for local persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// In-memory cache for serverless environments (e.g. Vercel)
let memoryConfig: AppConfig = { ...DEFAULT_CONFIG };
let memorySubmissions: DateSubmission[] = [];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem in Vercel is fine, fallback to memory
  }
}

export function getConfig(): AppConfig {
  try {
    ensureDataDir();
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      memoryConfig = { ...DEFAULT_CONFIG, ...parsed };
      return memoryConfig;
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
  return memoryConfig;
}

export function saveConfig(newConfig: Partial<AppConfig>): AppConfig {
  memoryConfig = { ...memoryConfig, ...newConfig };
  try {
    ensureDataDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(memoryConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing config file (serverless fallback active):', err);
  }
  return memoryConfig;
}

export function getSubmissions(): DateSubmission[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memorySubmissions = parsed;
        return memorySubmissions;
      }
    }
  } catch (err) {
    console.error('Error reading submissions file:', err);
  }
  return memorySubmissions;
}

export function addSubmission(submission: DateSubmission): void {
  memorySubmissions.unshift(submission);
  try {
    ensureDataDir();
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(memorySubmissions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing submissions file (serverless fallback active):', err);
  }
}

export function clearSubmissions(): void {
  memorySubmissions = [];
  try {
    ensureDataDir();
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error clearing submissions:', err);
  }
}

// Photos Management
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');

const defaultCaptions = [
  "Твоя улыбка делает любой день лучше ✨",
  "Один из моих любимых моментов с тобой",
  "Невероятно красивая и нежная 🌸",
  "Этот взгляд... я готов смотреть бесконечно",
  "С тобой даже самый обычный день особенный",
  "Каждый раз влюбляюсь заново ❤️",
  "Тепло, уют и ты рядом",
  "Самая яркая звёздочка ✨",
  "Обожаю, когда ты искренне смеёшься",
  "Твоя эстетика неповторима 🌷",
  "Момент, который хочется поставить на повтор",
  "Бесконечная нежность",
  "Ты вдохновляешь меня каждый день",
  "Твой свет согревает всё вокруг",
  "Прекрасна в любом образе 💫",
  "Хочу создавать еще больше таких моментов",
  "Самая любимая и родная ❤️",
  "Улыбайся чаще, это тебе так идёт!",
  "Маленькие радости рядом с тобой",
  "Этот день я запомню навсегда",
  "Неотразимая леди ✨",
  "С тобой время пролетает незаметно",
  "Ты — моё самое любимое счастье",
  "Просто идеальный кадр 📸",
  "Твоя энергетика притягивает магнитом",
  "Всё лучшее начинается с тебя",
  "Спасибо за то, что ты есть 💖",
  "Жду нашу следующую встречу с нетерпением!",
];

export function getDefaultPhotos(): import('./types').PhotoItem[] {
  return Array.from({ length: 28 }, (_, i) => ({
    id: `photo-${i + 1}`,
    src: `/photos/photo-${i + 1}.jpg`,
    caption: defaultCaptions[i % defaultCaptions.length],
    rotation: ((i % 5) - 2) * 1.5,
  }));
}

let memoryPhotos: import('./types').PhotoItem[] | null = null;

export function getPhotos(): import('./types').PhotoItem[] {
  if (memoryPhotos && memoryPhotos.length > 0) {
    return memoryPhotos;
  }
  try {
    ensureDataDir();
    if (fs.existsSync(PHOTOS_FILE)) {
      const data = fs.readFileSync(PHOTOS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryPhotos = parsed;
        return memoryPhotos;
      }
    }
  } catch (err) {
    console.error('Error reading photos file:', err);
  }
  memoryPhotos = getDefaultPhotos();
  try {
    ensureDataDir();
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(memoryPhotos, null, 2), 'utf-8');
  } catch {}
  return memoryPhotos;
}

export function savePhotos(photos: import('./types').PhotoItem[]): import('./types').PhotoItem[] {
  memoryPhotos = photos;
  try {
    ensureDataDir();
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(memoryPhotos, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving photos file:', err);
  }
  return memoryPhotos;
}

export function shufflePhotos(): import('./types').PhotoItem[] {
  const current = [...getPhotos()];
  for (let i = current.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [current[i], current[j]] = [current[j], current[i]];
  }
  // Recalculate rotations
  current.forEach((item, idx) => {
    item.rotation = ((idx % 5) - 2) * 1.5;
  });
  return savePhotos(current);
}

export function deletePhoto(id: string): import('./types').PhotoItem[] {
  const current = getPhotos();
  const updated = current.filter((p) => p.id !== id);
  return savePhotos(updated);
}

export function addPhoto(photo: import('./types').PhotoItem): import('./types').PhotoItem[] {
  const current = getPhotos();
  const updated = [photo, ...current];
  return savePhotos(updated);
}

export function updatePhotoCaption(id: string, caption: string): import('./types').PhotoItem[] {
  const current = getPhotos();
  const updated = current.map((p) => (p.id === id ? { ...p, caption } : p));
  return savePhotos(updated);
}
