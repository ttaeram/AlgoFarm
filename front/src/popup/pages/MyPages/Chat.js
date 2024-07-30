import * as styles from './Chat.module.css';

function ChatPopup({ onClose }) {
  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <span className={styles.closeButton} onClick={onClose}>&times;</span>
        <h2>그룹명</h2>
        <div className={styles.chatContent}>
          {/* 채팅 내용이 들어갈 부분 */}
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
