/**
 * popupHandler.js
 *
 * 이 파일은 팝업 관련 기능을 처리합니다.
 */

/**
 * 팝업 상태를 저장합니다.
 */
export function savePopupState() {
    chrome.storage.local.set({popupOpen: true});
}
/**
 * 팝업 상태를 복원합니다.
 */
export function restorePopupState() {
    chrome.storage.local.get(['popupOpen'], (result) => {
        if (result.popupOpen) {
            chrome.action.setBadgeText({text: '!'});
            chrome.action.setBadgeBackgroundColor({color: '#FF0000'});
            chrome.storage.local.set({popupOpen: false});
        }
    });
}
/**
 * 배지를 지웁니다.
 */
export function clearBadge() {
    chrome.action.setBadgeText({text: ''});
}