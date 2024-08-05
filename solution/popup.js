/* global oAuth2 */
/* eslint no-undef: "error" */

let action = false;

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
