import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'pendingFirebaseEmailLinkPayload';
const LOG_PREFIX = '[FirebaseEmailLinkStorage]';

export const storePendingFirebaseEmail = async payload => {
  console.log('[FirebaseEmailLinkStorage] storePendingFirebaseEmail called');
  console.log(
    '[FirebaseEmailLinkStorage] Payload to store:',
    JSON.stringify(payload),
  );
  if (!payload) {
    console.log(
      '[FirebaseEmailLinkStorage] No payload provided, skipping storage',
    );
    return;
  }

  try {
    console.log('[FirebaseEmailLinkStorage] Calling AsyncStorage.setItem...');
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    console.log('[FirebaseEmailLinkStorage] ✅ Payload stored successfully');
  } catch (error) {
    console.error('[FirebaseEmailLinkStorage] ❌ Failed to persist payload');
    console.error('[FirebaseEmailLinkStorage] Error:', error);
  }
};

export const readPendingFirebaseEmail = async () => {
  console.log('[FirebaseEmailLinkStorage] readPendingFirebaseEmail called');
  try {
    console.log('[FirebaseEmailLinkStorage] Calling AsyncStorage.getItem...');
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    console.log('[FirebaseEmailLinkStorage] Raw value from storage:', raw);
    if (!raw) {
      console.log('[FirebaseEmailLinkStorage] No data found in storage');
      return null;
    }
    const parsed = JSON.parse(raw);
    console.log(
      '[FirebaseEmailLinkStorage] ✅ Parsed payload:',
      JSON.stringify(parsed),
    );
    return parsed;
  } catch (error) {
    console.error('[FirebaseEmailLinkStorage] ❌ Failed to read payload');
    console.error('[FirebaseEmailLinkStorage] Error:', error);
    return null;
  }
};

export const clearPendingFirebaseEmail = async () => {
  console.log('[FirebaseEmailLinkStorage] clearPendingFirebaseEmail called');
  try {
    console.log(
      '[FirebaseEmailLinkStorage] Calling AsyncStorage.removeItem...',
    );
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[FirebaseEmailLinkStorage] ✅ Payload cleared successfully');
  } catch (error) {
    console.error('[FirebaseEmailLinkStorage] ❌ Failed to clear payload');
    console.error('[FirebaseEmailLinkStorage] Error:', error);
  }
};
