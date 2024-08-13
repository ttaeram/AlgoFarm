import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/context';


const WS_URL = `ws://i11a302.p.ssafy.io:8080/chat-websocket`;

const buildUrl = ({ groupId }) => `${WS_URL}/${groupId}`;
const isWebSocketOpen = (wsInstance) => wsInstance && wsInstance.readyState === WebSocket.OPEN;

export const useWebSocket = () => {
  const { jwt, groupId } = useAuth();
  const isMounted = useRef(true);
  const retryCount = useRef(0);
  const ws = useRef(null);
  const [webSocketData, setWebSocketData] = useState(null);

  useEffect(() => {
    retryCount.current = 0;
    isMounted.current = true;

    const setupWebSocket = (wsInstance) => {
      wsInstance.onopen = () => {
        retryCount.current = 0;
        // console.log('WebSocket 연결 성공');
      };

      wsInstance.onmessage = (event) => {
        if (isMounted.current && isWebSocketOpen(wsInstance)) {
          const resData = JSON.parse(event.data);
          setWebSocketData(resData);
          // console.log('메시지 수신:', resData);
        }
      };

      wsInstance.onerror = (event) => {
        // console.error('WebSocket 오류:', event);
        wsInstance.close(4000); // 명시적 close 실행
      };

      wsInstance.onclose = (event) => {
        if (isMounted.current) {
          // console.log(`WebSocket 닫힘: 코드(${event.code}), 이유(${event.reason})`);
          if (event.code !== 1000) { // 정상적인 종료가 아닌 경우
            retryWebSocketConnection();
          }
        }
      };
    };

    const retryWebSocketConnection = () => {
      if (retryCount.current < 5) {
        const interval = Math.min(1000 * Math.pow(2, retryCount.current), 30000); // 최대 30초까지 지연
        setTimeout(() => {
          ws.current = new WebSocket(buildUrl({ groupId }));
          setupWebSocket(ws.current);
          retryCount.current++;
        }, interval);
      }
    };

    if (groupId) {
      ws.current = new WebSocket(buildUrl({ groupId }));
      setupWebSocket(ws.current);
    }

    return () => {
      if (ws.current && isWebSocketOpen(ws.current)) {
        // console.info('WebSocket 연결 끊기');
        isMounted.current = false;
        ws.current.close();
      }
    };
  }, [groupId, jwt]);

  return { webSocketData };
};