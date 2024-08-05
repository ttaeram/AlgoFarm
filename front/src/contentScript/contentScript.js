import React from 'react';
import ReactDOM from 'react-dom';
import CharacterOverlay from './CharacterOverlay';

// 현재 URL 확인
const currentUrl = window.location.href;

// React 컴포넌트를 렌더링하는 함수
function renderOverlay() {
    const root = document.createElement('div');
    root.id = 'chrome-extension-root';
    root.style.position = 'fixed';
    root.style.top = '0';
    root.style.left = '0';
    root.style.width = '100%';
    root.style.height = '100%';
    root.style.zIndex = '9999';
    root.style.pointerEvents = 'none';
    document.body.appendChild(root);

    ReactDOM.render(<CharacterOverlay />, root);
}

// 공통 로직 실행
renderOverlay();
console.log('Common content script loaded');