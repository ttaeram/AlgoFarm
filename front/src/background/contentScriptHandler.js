/**
 * contentScriptHandler.js
 *
 * 이 파일은 콘텐츠 스크립트 관련 기능을 처리합니다.
 */

/**
 * 모든 탭의 콘텐츠 스크립트를 새로고침합니다.
 */
export function reloadContentScripts() {
    chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
            if (tab.url.includes('chrome://')) continue;
            chrome.tabs.sendMessage(tab.id, { action: "reloadContentScript" }, (response) => {
                if (chrome.runtime.lastError) {
                    chrome.tabs.reload(tab.id);
                } else {
                    // console.log(`Content script reloaded in tab ${tab.id}`);
                }
            });
        }
    });
}