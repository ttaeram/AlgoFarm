/**
 * background.js
 *
 * 이 파일은 Chrome 확장 프로그램의 주요 백그라운드 스크립트
 * 메시지 전달을 처리하고, 확장 프로그램을 초기화하며, 전반적인 기능을 관리
 */

import { solvedApiCall } from './api.js';
import { getDataFromIndexedDB, saveToStorage } from './storage.js';
import { savePopupState, restorePopupState, clearBadge } from './popupHandler.js';
import { reloadContentScripts } from './contentScriptHandler.js';

console.log('백그라운드 스크립트가 로드되었습니다.');

// 개발을 위한 핫 모듈 리로딩
if (module.hot) {
  module.hot.accept(() => {
    savePopupState();
    chrome.runtime.reload();
    reloadContentScripts();
  });
}

restorePopupState();

/**
 * 콘텐츠 스크립트와 팝업에서 오는 메시지를 처리합니다.
 * @param {Object} request - 요청 객체
 * @param {Object} sender - 발신자 객체
 * @param {function} sendResponse - 응답을 보내는 함수
 */
async function handleMessage(request, sender, sendResponse) {
  if (request.closeWebPage === true) {
    if (request.isSuccess === true) {
      saveToStorage({
        BaekjoonHub_username: request.username,
        BaekjoonHub_token: request.token,
        pipe_BaekjoonHub: false
      });
      chrome.tabs.create({ url: `chrome-extension://${chrome.runtime.id}/welcome.html`, active: true });
    } else {
      console.error('인증 실패!');
      if (sender.tab && sender.tab.id) {
        chrome.tabs.remove(sender.tab.id);
      }
    }
  } else if (request.sender === "baekjoon" && request.task === "SolvedApiCall") {
    const result = await solvedApiCall(request.problemId);
    sendResponse(result);
  } else if (request.action === 'clearBadge') {
    clearBadge();
  }
}

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getToken') {
    getDataFromIndexedDB()
        .then(token => sendResponse({ token }))
        .catch(() => sendResponse({ token: null }));
    return true;
  } else if (message.action === 'getShowCharacter') {
    chrome.storage.local.get('showCharacter', (result) => {
      sendResponse({ showCharacter: result.showCharacter === true });
    });
    return true;
  }
  handleMessage(message, sender, sendResponse);
  return true;
});

// 확장 프로그램 설치 시 리스너
chrome.runtime.onInstalled.addListener(() => {
  console.log('확장 프로그램이 설치되었습니다.');
  saveToStorage({ serverUrl: `${process.env.REACT_APP_SERVER_URL}` });
});

// 팝업이 열릴 때 리스너
chrome.action.onClicked.addListener((tab) => {
  clearBadge();
});