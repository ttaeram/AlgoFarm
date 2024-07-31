/* global oAuth2 */
/* eslint no-undef: "error" */

let action = false;

/* github를 사용하지 않아서 필요가 없다.*/
// $('#authenticate').on('click', () => {
//   if (action) {
//     oAuth2.begin();
//   }
// });

/* Get URL for welcome page */
// $('#welcome_URL').attr('href', `chrome-extension://${chrome.runtime.id}/welcome.html`);
// $('#hook_URL').attr('href', `chrome-extension://${chrome.runtime.id}/welcome.html`);

// chrome.storage.local.get('BaekjoonHub_token', (data) => {
//   const token = data.BaekjoonHub_token;
//   if (token === null || token === undefined) {
//     action = true;
//     $('#auth_mode').show();
//   } else {
//     // To validate user, load user object from GitHub.
//     const AUTHENTICATION_URL = 'https://api.github.com/user';

//     const xhr = new XMLHttpRequest();
//     xhr.addEventListener('readystatechange', function () {
//       if (xhr.readyState === 4) {
//         if (xhr.status === 200) {
//           /* Show MAIN FEATURES */
//           chrome.storage.local.get('mode_type', (data2) => {
//             if (data2 && data2.mode_type === 'commit') {
//               $('#commit_mode').show();
//               /* Get problem stats and repo link */
//               chrome.storage.local.get(['stats', 'BaekjoonHub_hook'], (data3) => {
//                 const BaekjoonHubHook = data3.BaekjoonHub_hook;
//                 if (BaekjoonHubHook) {
//                   $('#repo_url').html(`Your Repo: <a target="blank" style="color: cadetblue !important;" href="https://github.com/${BaekjoonHubHook}">${BaekjoonHubHook}</a>`);
//                 }
//               });
//             } else {
//               $('#hook_mode').show();
//             }
//           });
//         } else if (xhr.status === 401) {
//           // bad oAuth
//           // reset token and redirect to authorization process again!
//           chrome.storage.local.set({ BaekjoonHub_token: null }, () => {
//             console.log('BAD oAuth!!! Redirecting back to oAuth process');
//             action = true;
//             $('#auth_mode').show();
//           });
//         }
//       }
//     });
//     xhr.open('GET', AUTHENTICATION_URL, true);
//     xhr.setRequestHeader('Authorization', `token ${token}`);
//     xhr.send();
//   }
// });

/*
  초기에 활성화 데이터가 존재하는지 확인, 없으면 새로 생성, 있으면 있는 데이터에 맞게 버튼 조정
 */
chrome.storage.local.get('bjhEnable', (data4) => {
  if (data4.bjhEnable === undefined) {
    $('#onffbox').prop('checked', true);
    chrome.storage.local.set({ 'bjhEnable': $('#onffbox').is(':checked') }, () => { });
  }
  else {
    $('#onffbox').prop('checked', data4.bjhEnable);
    chrome.storage.local.set({ 'bjhEnable': $('#onffbox').is(':checked') }, () => { });
  }
})

/*
  활성화 버튼 클릭 시 storage에 활성 여부 데이터를 저장.
 */
$('#onffbox').on('click', () => {
  chrome.storage.local.set({ 'bjhEnable': $('#onffbox').is(':checked') }, () => { });
});


/*
  content.js랑 통신하기 위한 코드 -> 로그인에 사용할 헤더를 적용하기
*/
document.getElementById('saveButton').addEventListener('click', () => {
  const data = document.getElementById('dataInput').value;
  const request = indexedDB.open('MyDatabase', 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore('MyStore', { keyPath: 'id' });
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction('MyStore', 'readwrite');
    const store = transaction.objectStore('MyStore');
    store.put({ id: 'myData', value: data });

    transaction.oncomplete = () => {
      console.log('Data saved to IndexedDB');
    };
  };

  request.onerror = (event) => {
    console.error('Error opening IndexedDB', event);
  };
});
