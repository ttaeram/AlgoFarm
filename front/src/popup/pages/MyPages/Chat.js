import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import StompJs from 'stompjs';
import { useAuth } from '../../context/context';
import * as styles from './Chat.module.css';

function ChatPopup({ onClose }) {
  const { jwt, groupId, user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  let stompClient = null;

  useEffect(() => {
    connectWebSocket();
    fetchChatHistory();

    return () => {
      disconnectWebSocket();
    };
  }, [groupId]);

  const connectWebSocket = () => {
    console.log(jwt);
    const socketUrl = `http://i11a302.p.ssafy.io:8080/chat-websocket?token=${jwt}`;
    const socket = new SockJS(socketUrl);
    const headers = { Authorization: `Bearer ${jwt}` };
    stompClient = StompJs.over(socket, { headers });
    console.log("WebSocket 초기화");

    stompClient.debug = null;



    stompClient.connect(headers, (frame) => {
        console.log('WebSocket 연결 성공:', frame);

        const subscriptionPath = `/chat/${groupId}`;
        console.log('구독 경로:', subscriptionPath);

        stompClient.subscribe(subscriptionPath, (data) => {
            const newMessage = JSON.parse(data.body);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });
    }, (error) => {
        console.error('WebSocket 연결 오류:', error);
    });
};


  const disconnectWebSocket = () => {
    if (stompClient !== null) {
      stompClient.disconnect(() => {
        console.log('WebSocket 연결 해제');
      });
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`http://i11a302.p.ssafy.io:8080/api/chat/${groupId}/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!response.ok) {
        throw new Error('채팅 내역 불러오기 실패');
      }

      const result = await response.json();
      console.log('채팅 내역 데이터:', result);

      if (!Array.isArray(result.data)) {
        throw new Error('채팅 내역 데이터 형식 오류');
      }

      setMessages(result.data);
    } catch (err) {
      console.error('채팅 내역 불러오기 오류:', err);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && stompClient) {
      try {
        const data = {
          userId: user.id,
          groupId: groupId,
          content: messageInput,
          nickname: user.nickname,
          createdAt: new Date().toISOString()
        };

        stompClient.send(`/chat/send`, {}, JSON.stringify(data));
        console.log('메시지 전송:', data);

        await fetch(`http://i11a302.p.ssafy.io:8080/api/chat/${groupId}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify(data)
        });

        setMessageInput('');
      } catch (err) {
        console.error('메시지 전송 오류:', err);
      }
    }
  };

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <span className={styles.closeButton} onClick={onClose}>&times;</span>
        <h2>그룹 채팅</h2>
        <div className={styles.chatContent}>
          {messages.map((message, index) => (
            <div key={index}>
              {message.nickname}: {message.content} {new Date(message.createdAt).toLocaleString()}
            </div>
          ))}
        </div>
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.chatInput}
            placeholder="메시지를 입력하세요..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button className={styles.sendButton} onClick={handleSendMessage}>전송</button>
        </div>
      </div>
    </div>
  );
}

export default ChatPopup;
