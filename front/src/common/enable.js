/* 
  비활성화시 작동되지 않게 함
  가독성을 위해 따로 파일 분리함
*/
async function checkEnable() {
  const enable = await getObjectFromLocalStorage('Enable');
  if (!enable) {
    console.log("확장 off"); // 비활성화 시 콘솔 메시지 출력
  } else {
    console.log("확장 on"); // 활성화 시 콘솔 메시지 출력
  }
  return enable;
}

// 로컬 스토리지에서 객체 가져오기
function getObjectFromLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
}
