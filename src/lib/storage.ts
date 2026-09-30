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
