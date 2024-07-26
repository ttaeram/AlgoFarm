import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as styles from "./GroupLeaveButton.module.css";

const GroupLeaveButton = () => {
  const { jwt, setGroupId, groupId } = useAuth();
  const navigate = useNavigate();

  const handleLeaveGroup = async () => {
    try {
      const response = await fetch('http://i11a302.p.ssafy.io:8080/api/groups/members', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ groupId })
      });

      if (!response.ok) {
        throw new Error('Failed to leave group');
      }

      // 그룹 ID를 초기화
      setGroupId('-1');
      // 로그아웃을 원하지 않는다면 아래 줄을 주석 처리
      // signOut();
      navigate('/select-group');
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  return (
    <button onClick={handleLeaveGroup} className={styles.groupLeaveButton}>
      그룹 탈퇴
    </button>
  );
};

export default GroupLeaveButton;
