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


//탭의 변경을 식별하기 위한 리스너, 탭이 비활성화되면 동작한다.
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.sendMessage(activeInfo.tabId, { action: 'tabChanged' });
});

//탭의 변경을 식별하기 위한 리스너, 탭이 활성화되면 동작한다.
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.sendMessage(activeInfo.tabId, { action: 'tabActivated' });
});
