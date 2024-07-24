import React, { useState, useEffect } from "react";
import './Chat.css';

function ChatPopup({ onClose }) {
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    // 크롬 스토리지에서 서버 URL을 가져옵니다.
    chrome.storage.local.get(['serverUrl'], (result) => {
      if (result.serverUrl) {
        setServerUrl(result.serverUrl);
      }
    });
  }, []);

  return (
    <div className="popup">
      <div className="popupContent">
        <span className="closeButton" onClick={onClose}>&times;</span>
        <h2>그룹명</h2>
        <div className="chatContent">
          {/* 채팅 내용이 들어갈 부분 */}
          <p>서버 URL: {serverUrl}</p> {/* 서버 URL을 출력 */}
        </div>
        <div className="inputContainer">
          <input type="text" className="chatInput" placeholder="메시지를 입력하세요..." />
          <button className="sendButton">전송</button>
        </div>
      </div>
    </div>
  );
}

export default ChatPopup;