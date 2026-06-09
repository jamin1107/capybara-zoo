// ===== IndexedDB Save System =====

const DB_NAME = 'capybara_zoo';
const STORE_NAME = 'game_data';
const SAVE_KEY = 'main_save';

export interface SaveData {
  version: number;
  timestamp: number;
  gameHour: number;
  gameMinute: number;
  gold: number;
  capybaras: any[];
  unlockedFoods: string[];
  decorations: any[];
  farmPlots: any[];
  currentBackground: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function dbPut(key: string, value: any): Promise<void> {
  return openDB().then((db) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    })
  );
}

function dbGet<T>(key: string): Promise<T | null> {
  return openDB().then((db) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    })
  );
}

export async function saveToDB(): Promise<void> {
  try {
    const { useGameStore } = await import('@/store/gameStore');
    const state = useGameStore.getState();

    const saveData: SaveData = {
      version: 1,
      timestamp: Date.now(),
      gameHour: state.gameHour,
      gameMinute: state.gameMinute,
      gold: state.gold,
      capybaras: state.capybaras,
      unlockedFoods: state.unlockedFoods,
      decorations: state.decorations,
      farmPlots: state.farmPlots,
      currentBackground: state.currentBackground,
    };

    await dbPut(SAVE_KEY, saveData);
    console.log('[Save] Game saved to IndexedDB');
  } catch (err) {
    console.error('[Save] Failed to save to IndexedDB:', err);
  }
}

export async function loadFromDB(): Promise<SaveData | null> {
  try {
    const data = await dbGet<SaveData>(SAVE_KEY);
    if (data) {
      console.log('[Load] Game loaded from IndexedDB');
    }
    return data;
  } catch (err) {
    console.error('[Load] Failed to load from IndexedDB:', err);
    return null;
  }
}

export function exportSaveJSON(): void {
  const { useGameStore } = window as any;
  const state = useGameStore.getState();

  const saveData: SaveData = {
    version: 1,
    timestamp: Date.now(),
    gameHour: state.gameHour,
    gameMinute: state.gameMinute,
    gold: state.gold,
    capybaras: state.capybaras,
    unlockedFoods: state.unlockedFoods,
    decorations: state.decorations,
    farmPlots: state.farmPlots,
    currentBackground: state.currentBackground,
  };

  const jsonStr = JSON.stringify(saveData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `capybara_zoo_save_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importSaveJSON(json: string): Promise<boolean> {
  try {
    const saveData: SaveData = JSON.parse(json);

    // Basic validation
    if (!saveData.version || !saveData.timestamp) {
      console.error('[Import] Invalid save data format');
      return false;
    }

    // Load into store
    const { useGameStore } = await import('@/store/gameStore');
    const set = useGameStore.setState;

    set({
      gameHour: saveData.gameHour,
      gameMinute: saveData.gameMinute,
      gold: saveData.gold,
      capybaras: saveData.capybaras,
      unlockedFoods: saveData.unlockedFoods,
      decorations: saveData.decorations,
      farmPlots: saveData.farmPlots,
      currentBackground: saveData.currentBackground as any,
    });

    // Also save to DB
    await saveToDB();
    console.log('[Import] Save imported successfully');
    return true;
  } catch (err) {
    console.error('[Import] Failed to import save:', err);
    return false;
  }
}

export function startAutoSave(): void {
  setInterval(() => {
    saveToDB();
  }, 5 * 60 * 1000); // Every 5 minutes
  console.log('[AutoSave] Auto-save started (every 5 minutes)');
}
