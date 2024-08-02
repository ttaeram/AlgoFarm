import React from 'react';
import ReactDOM from 'react-dom';
import CharacterOverlay from './CharacterOverlay';
console.log('contentScript script loaded');

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

// 사이트별 스크립트 동적 로드
if (currentUrl.includes('acmicpc.net')) {
    import(/* webpackChunkName: "baekjoon" */ './baekjoon/baekjoon')
        .then(module => {
            console.log('Baekjoon script loaded');
            module.default(); // 또는 필요한 함수 호출
        })
        .catch(err => console.error('Error loading Baekjoon script', err));
}