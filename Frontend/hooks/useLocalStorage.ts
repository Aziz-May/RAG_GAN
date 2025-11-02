import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * useLocalStorage - Custom hook for persisting state to AsyncStorage
 * Automatically syncs state with device storage
 * 
 * @template T - Type of value stored
 * @param key - Storage key
 * @param initialValue - Initial value if not in storage
 * @returns [value, setValue, removeValue, isLoading]
 * 
 * @example
 * const [preferences, setPreferences] = useLocalStorage('user_prefs', {});
 * setPreferences({ theme: 'dark' });
 */
export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Save value to storage
  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from storage
  const removeValue = useCallback(async () => {
    try {
      setStoredValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, isLoading] as const;
};

export default useLocalStorage;
