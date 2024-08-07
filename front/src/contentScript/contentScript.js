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

    const root = ReactDOM.createRoot(rootElement);
    root.render(<CharacterOverlay />);
}

// 공통 로직 실행
renderOverlay();
console.log('Common content script loaded');
