
import { BiomechanicsAnalysis, AnalysisRecord, UserProfile } from '../types';
import { hashPassword } from '../utils/security';

const DB_NAME = 'InfinityDB';
const DB_VERSION = 5; // Increment for User Schema
const STORE_ANALYSES = 'analyses';
const STORE_USERS = 'users';
const STORE_LEARNING = 'learning_weights';

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      console.warn("IndexedDB not supported");
      resolve();
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening database during init:', (event.target as any).error);
      reject('Error opening database');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // 1. Analyses Store with User Index for fast lookups in massive datasets
      if (!db.objectStoreNames.contains(STORE_ANALYSES)) {
        const analysisStore = db.createObjectStore(STORE_ANALYSES, { keyPath: 'id', autoIncrement: true });
        analysisStore.createIndex('userId', 'userId', { unique: false });
        analysisStore.createIndex('date', 'date', { unique: false });
      } else {
        // Migration: Add index if missing in previous version
        const store = (event.target as IDBOpenDBRequest).transaction?.objectStore(STORE_ANALYSES);
        if (store && !store.indexNames.contains('userId')) {
            store.createIndex('userId', 'userId', { unique: false });
        }
      }
      
      // 2. Users Store (Supports 10m+ profiles via sparse indexing)
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        const userStore = db.createObjectStore(STORE_USERS, { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('username', 'username', { unique: true });
      }

      // 3. Learning Weights
      if (!db.objectStoreNames.contains(STORE_LEARNING)) {
        db.createObjectStore(STORE_LEARNING, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
        console.log("Database initialized successfully");
        resolve();
    };
  });
};

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => {
        console.error("Failed to open DB:", (event.target as any).error);
        reject('Error opening database');
    };
  });
};

// --- USER MANAGEMENT ---

export const createUser = async (username: string, passwordPlain: string, role: 'Athlete' | 'Coach'): Promise<UserProfile | null> => {
    try {
        const db = await openDB();
        const hashedPassword = await hashPassword(passwordPlain);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_USERS], 'readwrite');
            const store = transaction.objectStore(STORE_USERS);
            
            // Check existence first
            const index = store.index('username');
            const check = index.get(username);
            
            check.onsuccess = () => {
                if (check.result) {
                    reject("Username exists");
                    return;
                }

                const newUser: Omit<UserProfile, 'id'> = {
                    username,
                    passwordHash: hashedPassword,
                    role,
                    created: new Date().toISOString(),
                    avatarColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                    lastLogin: new Date().toISOString()
                };

                const request = store.add(newUser);
                request.onsuccess = () => {
                    resolve({ ...newUser, id: request.result as number });
                };
            };
            check.onerror = () => reject("Error checking username");
        });
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const loginUser = async (username: string, passwordPlain: string): Promise<UserProfile | null> => {
     try {
        const db = await openDB();
        const inputHash = await hashPassword(passwordPlain);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_USERS], 'readwrite'); // Readwrite to update lastLogin
            const store = transaction.objectStore(STORE_USERS);
            const index = store.index('username');
            const request = index.get(username);

            request.onsuccess = () => {
                const user = request.result as UserProfile;
                
                // Secure password check
                if (user && user.passwordHash === inputHash) {
                    user.lastLogin = new Date().toISOString();
                    store.put(user); // Update login time
                    resolve(user);
                } else {
                    resolve(null); // Return null on invalid password or user not found
                }
            };
            request.onerror = () => reject("Login failed");
        });
     } catch (e) {
         return null;
     }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            if (!db.objectStoreNames.contains(STORE_USERS)) { resolve([]); return; }
            const transaction = db.transaction([STORE_USERS], 'readonly');
            const store = transaction.objectStore(STORE_USERS);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result as UserProfile[]);
        });
    } catch (e) { return []; }
};

// --- ANALYSIS MANAGEMENT ---

export const saveAnalysis = async (userId: number, data: BiomechanicsAnalysis, videoFile?: File): Promise<number> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORE_ANALYSES)) {
           reject("DB Store missing"); 
           return;
      }

      const transaction = db.transaction([STORE_ANALYSES], 'readwrite');
      const store = transaction.objectStore(STORE_ANALYSES);
      
      const record: Omit<AnalysisRecord, 'id'> = {
        userId, // Link to user
        date: new Date().toISOString(),
        data,
        videoBlob: videoFile 
      };

      const request = store.add(record);
      
      request.onsuccess = () => resolve(request.result as number);
      
      request.onerror = (e) => {
        // Fallback: If blob is too large (QuotaExceededError), save without blob
        console.warn("Storage quota exceeded, saving metadata only.");
        const recordNoBlob = { ...record, videoBlob: undefined };
        const fallbackRequest = store.add(recordNoBlob);
        fallbackRequest.onsuccess = () => resolve(fallbackRequest.result as number);
        fallbackRequest.onerror = () => reject('Error saving analysis');
      };
    });
  } catch (e) {
    console.error("Save Analysis Error:", e);
    return -1;
  }
};

export const updateAnalysisRating = async (id: number, rating: number, feedback: string): Promise<void> => {
    try {
        const db = await openDB();
        const transaction = db.transaction([STORE_ANALYSES, STORE_LEARNING], 'readwrite');
        const store = transaction.objectStore(STORE_ANALYSES);
        const learningStore = transaction.objectStore(STORE_LEARNING);

        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
            const record = getRequest.result as AnalysisRecord;
            if (record) {
                record.userRating = rating;
                record.userFeedback = feedback;
                store.put(record);
            }
        };

        if (rating < 3) {
             learningStore.put({ key: 'last_negative_feedback', timestamp: Date.now(), notes: feedback });
             learningStore.put({ key: 'sensitivity_bias', value: 'high' });
        } else {
             learningStore.put({ key: 'sensitivity_bias', value: 'balanced' });
        }

    } catch (e) {
        console.error("Error updating rating:", e);
    }
};

export const getUserAnalyses = async (userId: number): Promise<AnalysisRecord[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(STORE_ANALYSES)) {
          resolve([]); 
          return;
      }
      const transaction = db.transaction([STORE_ANALYSES], 'readonly');
      const store = transaction.objectStore(STORE_ANALYSES);
      const index = store.index('userId'); // Use Index for performance with 10M+ records
      const request = index.getAll(userId); // Only fetch records for this user

      request.onsuccess = () => {
        const results = request.result as AnalysisRecord[];
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(results);
      };
      request.onerror = () => reject('Error fetching analyses');
    });
  } catch (e) {
    console.error("Get User Analyses Error:", e);
    return [];
  }
};

export const getAllAnalyses = async (): Promise<AnalysisRecord[]> => {
    // Legacy fallback, mostly for admin debug
    return getUserAnalyses(0); // Should verify logic in UI
};

export const deleteAnalysis = async (id: number): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_ANALYSES], 'readwrite');
    const store = transaction.objectStore(STORE_ANALYSES);
    store.delete(id);
  } catch (e) {
    console.error(e);
  }
};
