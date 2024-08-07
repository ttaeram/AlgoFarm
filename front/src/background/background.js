
/**
 * solvedac 문제 데이터를 파싱해오는 함수.
 * @param {int} problemId
 */
console.log('Background script loaded');

async function SolvedApiCall(problemId) {
  return fetch(`https://solved.ac/api/v3/problem/show?problemId=${problemId}`, { method: 'GET' })
      .then((query) => query.json());
}

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
      sendResponse({ token: token });
    }).catch(error => {
      sendResponse({ token: null });
    });
    // 비동기 응답을 보내기 위해 true를 반환합니다.
    return true;
  }
});

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
