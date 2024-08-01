chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // 서버 URL 환경 변수를 저장
  chrome.storage.local.set({ serverUrl: `${process.env.REACT_APP_SERVER_URL}` }, () => {
    console.log('Server URL is set.');
  });
});
