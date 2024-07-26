import React, { useState, useEffect } from "react";
import * as styles from "./Chat.module.css";

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
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <span className={styles.closeButton} onClick={onClose}>&times;</span>
        <h2>그룹명</h2>
        <div className={styles.chatContent}>
          {/* 채팅 내용이 들어갈 부분 */}
          <p>서버 URL: {serverUrl}</p> {/* 서버 URL을 출력 */}
        </div>
        <div className={styles.inputContainer}>
          <input type="text" className={styles.chatInput} placeholder="메시지를 입력하세요..." />
          <button className={styles.sendButton}>전송</button>
        </div>
      </div>
    </div>
  );
}

export default ChatPopup;