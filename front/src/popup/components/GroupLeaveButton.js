import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/context';
import { Button } from '@mui/material';
import * as styles from './GroupLeaveButton.module.css';

const GroupLeaveButton = () => {
  const { jwt, setGroupId, groupId, disappearCharacter} = useAuth();
  const navigate = useNavigate();

  const handleLeaveGroup = async () => {
    try {
      console.log('Attempting to leave group with ID:', groupId);
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ groupId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to leave group, server response:', errorData);
        throw new Error('Failed to leave group');
      }

      const data = await response.json();
      console.log('Group left successfully, server response:', data);

      // 그룹 ID를 초기화
      setGroupId('-1');
      // 로그아웃을 원하지 않는다면 아래 줄을 주석 처리
      // signOut();
      disappearCharacter();
      navigate('/select-group');
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  // return (
  //   <Button
  //     onClick={handleLeaveGroup}
  //     className={styles.groupLeaveButton}
  //     variant="contained"
  //     color="#eb647e"

  //   >
  //     그룹탈퇴
  //   </Button>
  // );
  return (
    <Button
      onClick={handleLeaveGroup}
      className={styles.groupLeaveButton}
      variant="contained"
      style={{ backgroundColor: '#eb647e' }}  // style 속성을 사용하여 배경색을 직접 지정
    >
      그룹탈퇴
    </Button>
  );
};

export default GroupLeaveButton;
