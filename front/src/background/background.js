chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // 서버 URL 환경 변수를 저장
  chrome.storage.local.set({ serverUrl: 'http://i11a302.p.ssafy.io:8080' }, () => {
    console.log('Server URL is set.');
  });
});
