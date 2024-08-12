
/**
 * solvedac 문제 데이터를 파싱해오는 함수.
 * @param {int} problemId
 */
console.log('Background script loaded');

async function SolvedApiCall(problemId) {
  return fetch(`https://solved.ac/api/v3/problem/show?problemId=${problemId}`, { method: 'GET' })
      .then((query) => query.json());
}
// 팝업 상태를 저장하는 함수
function savePopupState() {
  chrome.storage.local.set({popupOpen: true});
}

// 팝업 상태를 복원하는 함수
function restorePopupState() {
  chrome.storage.local.get(['popupOpen'], (result) => {
    if (result.popupOpen) {
      chrome.action.openPopup();
      chrome.storage.local.set({popupOpen: false});
    }
  });
}

// 변경 사항을 감지하여 익스텐션을 새로고침
if (module.hot) {
  module.hot.accept(() => {
    savePopupState();
    chrome.runtime.reload();
    reloadContentScripts();
  });
}
// 컨텐츠 스크립트 새로고침 함수
function reloadContentScripts() {
  chrome.tabs.query({}, (tabs) => {
    for (let tab of tabs) {
      if (tab.url.includes('chrome://')) continue; // chrome:// URLs에서는 스크립트를 실행할 수 없습니다.
      chrome.tabs.sendMessage(tab.id, { action: "reloadContentScript" }, (response) => {
        if (chrome.runtime.lastError) {
          // 에러가 발생하면 탭을 새로고침합니다.
          chrome.tabs.reload(tab.id);
        } else {
          console.log(`Content script reloaded in tab ${tab.id}`);
        }
      });
    }
  });
}

// 확장 프로그램이 시작될 때 팝업 상태 복원
restorePopupState();

function handleMessage(request, sender, sendResponse) {
  if (request && request.closeWebPage === true && request.isSuccess === true) {
    /* Set username */
    chrome.storage.local.set(
        { BaekjoonHub_username: request.username } /* , () => {
      window.localStorage.BaekjoonHub_username = request.username;
    } */,
    );

    /* Set token */
    chrome.storage.local.set(
        { BaekjoonHub_token: request.token } /* , () => {
      window.localStorage[request.KEY] = request.token;
    } */,
    );

    /* Close pipe */
    chrome.storage.local.set({ pipe_BaekjoonHub: false }, () => {
      console.log('Closed pipe.');
    });

    // chrome.tabs.getSelected(null, function (tab) {
    //   chrome.tabs.remove(tab.id);
    // });

    /* Go to onboarding for UX */
    const urlOnboarding = `chrome-extension://${chrome.runtime.id}/welcome.html`;
    chrome.tabs.create({ url: urlOnboarding, selected: true }); // creates new tab
  } else if (request && request.closeWebPage === true && request.isSuccess === false) {
    alert('Something went wrong while trying to authenticate your profile!');
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.remove(tab.id);
    });
  } else if (request && request.sender == "baekjoon" && request.task == "SolvedApiCall") {
    SolvedApiCall(request.problemId).then((res) => sendResponse(res));
    //sendResponse(SolvedApiCall(request.problemId))
  }
  return true;
}
chrome.runtime.onMessage.addListener(handleMessage);


/* 커밋 요청시 헤더에 Authorization 토큰을 넣기 위한 background*/
/* 커밋 요청시 헤더에 토큰을 넣기 위한 background*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getToken') {
    getDataFromIndexedDB().then(token => {
      // getDataFromLocalStorage().then(token => {
      sendResponse({ token: token });
    }).catch(error => {
      sendResponse({ token: null });
    });
    // 비동기 응답을 보내기 위해 true를 반환합니다.
    return true;
  }

  if (message.action === 'getShowCharacter') {
    chrome.storage.local.get('showCharacter', (result) => {
      console.log("getShowCharacter에 요청이 들어왔습니다.", "result =" , result.showCharacter)
    if(result.showCharacter === true) 
      sendResponse({ showCharacter: true });
    else
      sendResponse({ showCharacter: false });
  });
}
});

//localstorage에서 jwt토큰을 가져오는 코드
function getDataFromLocalStorage() {
  return new Promise((resolve, reject) => {
    try {
      const token = localStorage.getItem('jwt');
      if (token !== null) {
        resolve(token);
      } else {
        reject('No token found in localStorage');
      }
    } catch (error) {
      reject('Error accessing localStorage');
    }
  });
}

function getDataFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyDatabase', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('MyStore', 'readonly');
      const store = transaction.objectStore('MyStore');
      const getRequest = store.get('jwt');

      getRequest.onsuccess = (event) => {
        resolve(event.target.result?.value);
      };

      getRequest.onerror = (event) => {
        reject('Error getting data from IndexedDB');
      };
    };

    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };
  });
}
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // 서버 URL 환경 변수를 저장
  chrome.storage.local.set({ serverUrl: `${process.env.REACT_APP_SERVER_URL}` }, () => {
    console.log('Server URL is set.');
  });
});

//chrome.storage.local에 showCharacter가 true인 경우에만 동작한다.
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === 'getShowCharacter') {
//       chrome.storage.local.get('showCharacter', (result) => {
//         console.log("getShowCharacter에 요청이 들어왔습니다.", "result =" , result.showCharacter)
//       if(result.showCharacter === true) 
//         sendResponse({ showCharacter: true });
//       else
//         sendResponse({ showCharacter: false });
//     });
//   }
// });

let lastActiveTabId = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (lastActiveTabId !== null && lastActiveTabId !== activeInfo.tabId) {
    // 이전 탭에서 활성화된 탭으로의 변경을 감지
    chrome.tabs.sendMessage(lastActiveTabId, { action: 'tabChanged' });
  }

  // 현재 탭 활성화
  chrome.tabs.sendMessage(activeInfo.tabId, { action: 'tabActivated' });

  // 현재 활성화된 탭 ID 업데이트
  lastActiveTabId = activeInfo.tabId;
});


// //탭의 변경을 식별하기 위한 리스너, 탭이 비활성화되면 동작한다.
// chrome.tabs.onActivated.addListener((activeInfo) => {
//   chrome.tabs.sendMessage(activeInfo.tabId, { action: 'tabChanged' });
// });

// //탭의 변경을 식별하기 위한 리스너, 탭이 활성화되면 동작한다.
// chrome.tabs.onActivated.addListener((activeInfo) => {
//   chrome.tabs.sendMessage(activeInfo.tabId, { action: 'tabActivated' });
// });
