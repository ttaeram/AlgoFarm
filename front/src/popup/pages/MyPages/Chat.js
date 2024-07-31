import React, { useState, useEffect, useRef } from 'react';
import * as StompJs from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from '../../context/context';
import * as styles from './Chat.module.css';

function ChatPopup() {
  const { jwt, groupId } = useAuth();
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const client = useRef(null);

  useEffect(() => {
    connect();

    return () => disconnect();
  }, []);

  const connect = () => {
    client.current = new StompJs.Client({
      brokerURL: "http://i11a302.p.ssafy.io:8080/chat-websocket", // 웹소켓 서버로 직접 접속
      // webSocketFactory: () => new SockJS("/chat-websocket"), // proxy를 통한 접속
      connectHeaders: {
        "auth-token": `Bearer ${jwt}`,
      },
      debug: function (str) {
        console.log('678')
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("456")
        subscribe();
      },
      onStompError: (frame) => {
        console.log('567')
        console.error(frame);
      },
    });
    console.log("123")
    client.current.activate();
  };

  const disconnect = () => {
    client.current.deactivate();
  };

  const subscribe = () => {
    console.log("234")
    client.current.subscribe(`/chat/${groupId}`, ({ body }) => {
      setChatMessages((_chatMessages) => [..._chatMessages, JSON.parse(body)]);
    });
  };

  const publish = (message) => {
    if (!client.current.connected) {
      return;
    }
    console.log("345")
    client.current.publish({
      destination: "/chat",
      body: JSON.stringify({ roomSeq: groupId, message }),
    });

    setMessage("");
  };


  return (
    <div>
      {chatMessages && chatMessages.length > 0 && (
        <ul>
          {chatMessages.map((_chatMessage, index) => (
            <li key={index}>{_chatMessage.message}</li>
          ))}
        </ul>
      )}
      <div>
        <input
          type={"text"}
          placeholder={"message"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.which === 13 && publish(message)}
        />
        <button onClick={() => publish(message)}>send</button>
      </div>
    </div>
  );
}

export default ChatPopup;
