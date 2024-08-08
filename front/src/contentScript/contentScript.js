import React from 'react';
import ReactDOM from 'react-dom';
import CharacterOverlay from './CharacterOverlay';

// React 컴포넌트를 렌더링하는 함수
function renderOverlay() {
    const rootElement = document.createElement('div');
    rootElement.id = 'chrome-extension-root';
    rootElement.style.position = 'fixed';
    rootElement.style.top = '0';
    rootElement.style.left = '0';
    rootElement.style.width = '100%';
    rootElement.style.height = '100%';
    rootElement.style.zIndex = '9999';
    rootElement.style.pointerEvents = 'none';
    document.body.appendChild(rootElement);
    console.log('Rendered overlay');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<CharacterOverlay />);
}

// 오버레이를 제거하는 함수
function removeOverlay() {
    const rootElement = document.getElementById('chrome-extension-root');
    if (rootElement) {
        ReactDOM.unmountComponentAtNode(rootElement);
        rootElement.remove();
    }
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
    const showCharacter = true;
    if (showCharacter) {
        renderOverlay();
    }
    console.log('Content script loaded, character visibility:', showCharacter !== false);
})();

// 메시지 리스너 추가
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleCharacterVisibility") {
        if (request.isVisible) {
            renderOverlay();
        } else {
            removeOverlay();
        }
    }
    if (request.action === "reloadContentScript") {
        removeOverlay();
        renderOverlay();
        sendResponse({status: "reloaded"});
    }
});