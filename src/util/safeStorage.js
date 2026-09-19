export function storageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (_) {
        return null;
    }
}

export function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (_) {
        /* blocked in some embedded WebViews */
    }
}

export function storageRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch (_) {}
}
