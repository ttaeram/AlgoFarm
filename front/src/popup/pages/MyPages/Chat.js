import React, { useState, useEffect, useRef } from 'react';
import * as StompJs from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from '../../context/context';
import * as styles from './Chat.module.css';

function ChatPopup({ onClose }) {
  const { jwt, groupId, user } = useAuth(); // user 추가
  const [chatMessages, setChatMessages] = useState([]);
  const [previousChatMessages, setPreviousChatMessages] = useState([]); // New state for previous chat messages
  const [message, setMessage] = useState("");
  const client = useRef(null);

  useEffect(() => {
    fetchChatHistory();
    connect();

    return () => disconnect();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/chat/${groupId}/all`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      });
      const data = await response.json();
      // 데이터가 배열이 아니라면, 배열로 변환하거나 올바른 데이터를 추출
      if (data && Array.isArray(data.data)) {
        setPreviousChatMessages(data.data); // Store previous chat messages
      } else {
        setPreviousChatMessages([]); // Default to an empty array
      }
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  };

  const connect = () => {
    client.current = new StompJs.Client({
      brokerURL: `${process.env.REACT_APP_SERVER_URL}/chat-websocket`,
      connectHeaders: {
        "auth-token": `Bearer ${jwt}`,
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        subscribe();
      },
      onStompError: (frame) => {
        console.error(frame);
      },
    });
    client.current.activate();
  };

  const disconnect = () => {
    if (client.current) {
      client.current.deactivate();
    }
  };

  const subscribe = () => {
    client.current.subscribe(`/chat/${groupId}`, ({ body }) => {
      console.log('Received message:', body);
      try {
        const message = JSON.parse(body);
        setChatMessages((_chatMessages) => [..._chatMessages, message]);
      } catch (error) {
        // JSON 형식이 아닌 경우 일반 텍스트로 처리
        console.error('Failed to parse message as JSON:', error);
        setChatMessages((_chatMessages) => [..._chatMessages, { content: body, nickname: user.name }]);
      }
    });
  };

  const publish = async (message) => {
    if (!client.current.connected) {
      console.error('WebSocket is not connected');
      return;
    }
    const newMessage = {
      roomSeq: groupId,
      content: message,
      nickname: user.name
    };

    const serverLogMessage = {
      userId: user.userId, // Assuming user object has userId
      groupId,
      content: message,
      nickname: user.name, // Assuming user object has nickname
      createAt: new Date().toISOString()
    };

    // Send the message via WebSocket
    client.current.publish({
      destination: "/chat",
      body: JSON.stringify(newMessage),
    });

    // 서버에 메시지를 기록할 때, WebSocket을 통해 다시 수신할 수 있으므로 상태를 업데이트하지 않습니다.
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/chat/${groupId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(serverLogMessage)
      });

      if (!response.ok) {
        throw new Error('Failed to log message to server');
      }
    } catch (error) {
      console.error('Error logging message to server:', error);
    }

    // 사용자가 직접 보낸 메시지를 WebSocket을 통해 수신할 때 중복되지 않도록 상태를 업데이트하지 않습니다.
    setMessage("");
  };

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <span className={styles.closeButton} onClick={onClose}>&times;</span>
        <h2>그룹명</h2>
        <div className={styles.chatContent}>
          <h3>이전 채팅 기록</h3>
          <ul>
            {previousChatMessages.map((_chatMessage, index) => (
              <li key={index}>
                {_chatMessage.nickname ? `${_chatMessage.nickname}: ` : ''}{_chatMessage.content}
              </li>
            ))}
          </ul>
          <h3>새로운 메시지</h3>
          <ul>
            {chatMessages.map((_chatMessage, index) => (
              <li key={index}>
                {_chatMessage.nickname ? `${_chatMessage.nickname}: ` : ''}{_chatMessage.content}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.chatInput}
            placeholder="메시지를 입력하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.which === 13 && publish(message)}
          />
          <button className={styles.sendButton} onClick={() => publish(message)}>전송</button>
        </div>
      </div>
    </div>
  );
}

export default ChatPopup;
