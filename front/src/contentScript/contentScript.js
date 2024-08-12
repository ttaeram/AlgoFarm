import React from 'react';
import ReactDOM from 'react-dom';
import CharacterOverlay from './CharacterOverlay';
import confetti from 'canvas-confetti';

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

// Shake 효과를 적용하는 함수
function applyShakeEffect() {
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
    }, 500);
}

// 초기 실행
(async function init() {

    var showCharacter
    chrome.runtime.sendMessage({ action: 'getShowCharacter' }, (response) => {
    showCharacter = response.showCharacter;
    console.log('캐릭터 response=',showCharacter)
    if(response.showCharacter === true){
        renderOverlay();
    }
  });

    // const showCharacter = false;
    // if (showCharacter) {
    //     renderOverlay();
    // }
    // console.log('Content script loaded, character visibility:', showCharacter);
})();

// CustomEvent 리스너 추가
document.addEventListener('baekjoonSuccess', (event) => {
    console.log('백준 문제 풀이 성공!');
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
});

//실패
document.addEventListener('baekjoonFail', (event) => {
    applyShakeEffect();
});

//채점중 확인용
// document.addEventListener('baekjoonJudging', (event) => {
//     console.log('백준 문제 채점중!');
// });

// 메시지 리스너 추가 (크롬 API 사용 부분 유지)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "toggleCharacterVisibility":
            if (request.isVisible) {
                renderOverlay();
            } else {
                removeOverlay();
            }
            break;
        case "reloadContentScript":
            removeOverlay();
            renderOverlay();
            sendResponse({status: "reloaded"});
            break;
    }
});

// CSS for shake effect
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0% { transform: translate(1px, 1px) rotate(0deg); }
        10% { transform: translate(-1px, -2px) rotate(-1deg); }
        20% { transform: translate(-3px, 0px) rotate(1deg); }
        30% { transform: translate(3px, 2px) rotate(0deg); }
        40% { transform: translate(1px, -1px) rotate(1deg); }
        50% { transform: translate(-1px, 2px) rotate(-1deg); }
        60% { transform: translate(-3px, 1px) rotate(0deg); }
        70% { transform: translate(3px, 1px) rotate(-1deg); }
        80% { transform: translate(-1px, -1px) rotate(1deg); }
        90% { transform: translate(1px, 2px) rotate(0deg); }
        100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
    .shake {
        animation: shake 0.5s;
        animation-iteration-count: 1;
    }
`;
document.head.appendChild(style);