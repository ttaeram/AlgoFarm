import { useState, useEffect, useRef } from 'react';
import * as StompJs from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from '../../context/context';
import * as styles from './Chat.module.css';

function ChatPopup({ onClose }) {
  const { jwt, groupId, user } = useAuth(); // user 추가
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false); // 초기 메시지 로드 상태
  const client = useRef(null);

  useEffect(() => {
    fetchChatHistory();
    connect();

    return () => disconnect();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`https://i11a302.p.ssafy.io/api/chat/${groupId}/all`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      });
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setChatMessages(data.data);
      } else {
        setChatMessages([]);
      }
      setInitialMessagesLoaded(true); // 초기 메시지 로드 완료
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  };

  const connect = () => {
    client.current = new StompJs.Client({
      brokerURL: "https://i11a302.p.ssafy.io/chat-websocket",
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
        if (initialMessagesLoaded) {
          setChatMessages((prevMessages) => [...prevMessages, message]);
        }
      } catch (error) {
        console.error('Failed to parse message as JSON:', error);
        if (initialMessagesLoaded) {
          setChatMessages((prevMessages) => [...prevMessages, { content: body }]);
        }
      }
    });
  };

  const publish = async (content) => {
    if (!client.current.connected) {
      console.error('WebSocket is not connected');
      return;
    }
    const newMessage = {
      roomSeq: groupId,
      message: content
    };

    const serverLogMessage = {
      userId: user.userId, // Assuming user object has userId
      groupId,
      content,
      nickname: user.name, // Assuming user object has nickname
      createAt: new Date().toISOString()
    };

    // Send the message via WebSocket
    client.current.publish({
      destination: "/chat",
      body: JSON.stringify(newMessage),
    });

    // Log the message to the server
    try {
      const response = await fetch(`https://i11a302.p.ssafy.io/api/chat/${groupId}/send`, {
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

    // Add the new message to chat immediately without duplicating it
    setChatMessages((prevMessages) => [...prevMessages, serverLogMessage]);
    setMessage("");
  };

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <span className={styles.closeButton} onClick={onClose}>&times;</span>
        <h2>그룹명</h2>
        <div className={styles.chatContent}>
          <ul>
            {chatMessages.map((msg, index) => (
              <li key={index}>
                {msg.name ? `${msg.name}: ` : ''}{msg.content}
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