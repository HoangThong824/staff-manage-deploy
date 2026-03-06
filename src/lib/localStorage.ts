"use client";

/**
 * A safe utility for interacting with window.localStorage in Next.js (SSR safe).
 */
export const storage = {
    /**
     * Get an item from localStorage
     * @param key The key to retrieve
     * @returns The parsed value or null
     */
    get: <T>(key: string): T | null => {
        if (typeof window === 'undefined') return null;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return null;
        }
    },

    /**
     * Set an item in localStorage
     * @param key The key to set
     * @param value The value to store (will be JSON stringified)
     */
    set: (key: string, value: any): void => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    },

    /**
     * Remove an item from localStorage
     * @param key The key to remove
     */
    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    },

    /**
     * Clear all items from localStorage
     */
    clear: (): void => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

export default storage;
