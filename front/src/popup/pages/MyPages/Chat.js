import React, { useState, useEffect, useRef } from 'react';
import * as StompJs from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from '../../context/context';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';

const StyledButton = styled(Button)`
  background-color: #f19cac;
  color: white;
  &:hover {
    background-color: #FD88A0;
  }
`;

const StyledCard = styled(Card)`
  max-width: 80%;
  margin-bottom: 1rem;
  background-color: ${({ isOwnMessage }) => (isOwnMessage ? '#FCE6E0' : 'white')};
`;

const StyledDialogContent = styled(DialogContent)`
  overflow-y: auto;
  scrollbar-width: none;
  ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ChatPopup = ({ onClose }) => {
  const { jwt, groupId, user, groupInfo, nickname } = useAuth();
  const [chatMessages, setChatMessages] = useState([]);
  const [previousChatMessages, setPreviousChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const client = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
    connect();

    return () => disconnect();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, previousChatMessages]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/chat/${groupId}/all`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      });
      const data = await response.json();
      if (data && Array.isArray(data.data)) {
        setPreviousChatMessages(data.data);
      } else {
        setPreviousChatMessages([]);
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
        console.error('Failed to parse message as JSON:', error);
        setChatMessages((_chatMessages) => [..._chatMessages, { userId: body.userId, content: body.content, nickname: body.nickname, createAt: body.createAt }]);
      }
    });
  };

  const publish = async (message) => {
    if (!client.current.connected) {
      console.error('WebSocket is not connected');
      return;
    }
    const newMessage = {
      userId: user.sub,
      roomSeq: groupId,
      content: message,
      nickname: nickname,
      createAt: new Date().toISOString()
    };

    const serverLogMessage = {
      userId: user.sub,
      groupId,
      content: message,
      nickname: nickname,
      createAt: new Date().toISOString()
    };

    client.current.publish({
      destination: "/chat",
      body: JSON.stringify(newMessage),
    });

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

    setMessage("");
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    const koreaDate = new Date(utcDate.getTime() + (9 * 60 * 60000) * 2); // 대한민국 시간 (UTC+9)
    return `${koreaDate.toLocaleDateString()} ${koreaDate.toLocaleTimeString()}`;
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {groupInfo.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <StyledDialogContent dividers>
        <List>
          {previousChatMessages.map((_chatMessage, index) => (
            <ListItem 
              key={index} 
              disableGutters 
              sx={{ 
                display: 'flex', 
                justifyContent: _chatMessage.userId === user.sub ? 'flex-end' : 'flex-start' 
              }}>
              <StyledCard isOwnMessage={_chatMessage.userId === user.sub}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    {_chatMessage.nickname} - {formatDate(_chatMessage.createAt)}
                  </Typography>
                  <Typography variant="body1">
                    {_chatMessage.content}
                  </Typography>
                </CardContent>
              </StyledCard>
            </ListItem>
          ))}
          {chatMessages.map((_chatMessage, index) => (
            <ListItem 
              key={index} 
              disableGutters 
              sx={{ 
                display: 'flex', 
                justifyContent: _chatMessage.userId === user.sub ? 'flex-end' : 'flex-start' 
              }}>
              <StyledCard isOwnMessage={_chatMessage.userId === user.sub}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    {_chatMessage.nickname} - {formatDate(_chatMessage.createAt)}
                  </Typography>
                  <Typography variant="body1">
                    {_chatMessage.content}
                  </Typography>
                </CardContent>
              </StyledCard>
            </ListItem>
          ))}
          <div ref={chatEndRef} />
        </List>
      </StyledDialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', width: '100%' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="메시지를 입력하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.which === 13 && publish(message)}
          />
          <StyledButton variant="contained" onClick={() => publish(message)}>전송</StyledButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ChatPopup;
