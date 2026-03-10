"use client";

/**
 * storage: A safe utility for interacting with window.localStorage in Next.js (SSR safe).
 * Công cụ hỗ trợ tương tác an toàn với LocalStorage trong môi trường SSR (Next.js).
 */
export const storage = {
    /**
     * Get an item from localStorage
     * Lấy dữ liệu từ LocalStorage dựa trên Key
     * @param key The key to retrieve
     * @returns The parsed value or null
     */
    get: <T>(key: string): T | null => {
        // Ensure this only runs on the client-side
        // Đảm bảo mã chỉ chạy ở phía trình duyệt
        if (typeof window === 'undefined') return null;
        try {
            const item = window.localStorage.getItem(key);
            // Parse JSON string back to object
            // Chuyển đổi chuỗi JSON ngược thành đối tượng
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return null;
        }
    },

    /**
     * Set an item in localStorage
     * Lưu dữ liệu vào LocalStorage
     * @param key The key to set
     * @param value The value to store (will be JSON stringified)
     */
    set: (key: string, value: any): void => {
        if (typeof window === 'undefined') return;
        try {
            // Stringify objects before storing
            // Chuyển đổi dữ liệu thành chuỗi JSON trước khi lưu
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    },

    /**
     * Remove an item from localStorage
     * Xóa dữ liệu khỏi LocalStorage dựa trên Key
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
     * Xóa toàn bộ dữ liệu trong LocalStorage
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
