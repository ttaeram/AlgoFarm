/**
 * storage.js
 *
 * 이 파일은 Chrome 스토리지와 IndexedDB 관련 기능을 처리합니다.
 */

/**
 * Chrome 로컬 스토리지에 데이터를 저장합니다.
 * @param {Object} data - 저장할 데이터
 * @returns {Promise<void>}
 */
export function saveToStorage(data) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(data, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

/**
 * IndexedDB에서 데이터를 가져옵니다.
 * @returns {Promise<any>} IndexedDB에서 가져온 데이터
 */
export async function getDataFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('MyDatabase', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('MyStore', 'readonly');
            const store = transaction.objectStore('MyStore');
            const getRequest = store.get('jwt');
            getRequest.onsuccess = (event) => resolve(event.target.result?.value);
            getRequest.onerror = () => reject('Error getting data from IndexedDB');
        };
        request.onerror = () => reject('Error opening IndexedDB');
    });
}