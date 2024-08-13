import React from 'react';
import ReactDOM from 'react-dom';
import CharacterOverlay from './CharacterOverlay';
import confetti from 'canvas-confetti';

let root = null;

function renderOverlay() {
    let rootElement = document.getElementById('chrome-extension-root');
    if (!rootElement) {
        rootElement = document.createElement('div');
        rootElement.id = 'chrome-extension-root';
        rootElement.style.position = 'fixed';
        rootElement.style.top = '0';
        rootElement.style.left = '0';
        rootElement.style.width = '100%';
        rootElement.style.height = '100%';
        rootElement.style.zIndex = '9999';
        rootElement.style.pointerEvents = 'none';
        document.body.appendChild(rootElement);
    }
    if (!root) {
        root = ReactDOM.createRoot(rootElement);
    }
    root.render(<CharacterOverlay />);
}

function removeOverlay() {
    if (root) {
        root.unmount();
        root = null;
    }
    const rootElement = document.getElementById('chrome-extension-root');
    if (rootElement) {
        rootElement.remove();
    }
}

function applyShakeEffect() {
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
    }, 500);
}

(async function init() {
    // console.log("Initializing content script");
    chrome.storage.local.get(['showCharacter', 'character'], (result) => {
        if (result.showCharacter === true && result.character) {
            renderOverlay();
        }
    });
})();

// storage 변경 사항을 감지하여 오버레이를 렌더링하거나 제거합니다.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.showCharacter) {
        // console.log("entry")
        if (changes.showCharacter.newValue === true) {
            renderOverlay();
        } else {
            removeOverlay();
        }
    }
});

document.addEventListener('baekjoonSuccess', (event) => {
    // console.log('백준 문제 풀이 성공!');
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
});

document.addEventListener('baekjoonFail', (event) => {
    applyShakeEffect();
});

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
        case "leaveGroup":
            removeOverlay();
            break;
        case "joinGroup":
            renderOverlay();
            break;
    }
});

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'tabChanged') {
        removeOverlay();
    }
    if (message.action === 'tabActivated') {
        activateFeature();
    }
});

function activateFeature() {
    chrome.storage.local.get(['showCharacter', 'character'], (result) => {
        if (result.showCharacter === true && result.character) {
            renderOverlay();
        }
    });
}

document.head.appendChild(style);