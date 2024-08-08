import React from 'react';
import ReactDOM from 'react-dom';
import CharacterOverlay from './CharacterOverlay';

// React 컴포넌트를 렌더링하는 함수
function renderOverlay(isVisible) {
    const rootElement = document.createElement('div');
    rootElement.id = 'chrome-extension-root';
    rootElement.style.position = 'fixed';
    rootElement.style.top = '0';
    rootElement.style.left = '0';
    rootElement.style.width = '100%';
    rootElement.style.height = '100%';
    rootElement.style.zIndex = '9999';
    rootElement.style.pointerEvents = 'none';
    rootElement.style.display = isVisible ? 'block' : 'none';
    document.body.appendChild(rootElement);

    const root = ReactDOM.createRoot(rootElement);
    root.render(<CharacterOverlay initialVisibility={isVisible} />);
}
// 로컬 스토리지에서 상태를 가져오는 함수
function getStorageData(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
            resolve(result[key]);
        });
    });
}
// 초기 실행
(async function init() {
    const Enable = await getStorageData('Enable');
    const isVisible = Enable !== false; // undefined일 경우 true로 처리
    renderOverlay(isVisible);
    console.log('Content script loaded, character visibility:', isVisible);
})();

// 메시지 리스너 추가
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleVisibility") {
        const rootElement = document.getElementById('chrome-extension-root');
        if (rootElement) {
            rootElement.style.display = request.isVisible ? 'block' : 'none';
        }
    }
    if (request.action === "reloadContentScript") {
        // 기존 요소 제거
        const oldRoot = document.getElementById('chrome-extension-root');
        if (oldRoot) oldRoot.remove();

        // 오버레이 다시 렌더링
        renderOverlay();

        sendResponse({status: "reloaded"});
    }
});