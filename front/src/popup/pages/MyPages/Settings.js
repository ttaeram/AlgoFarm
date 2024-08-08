import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/context";
import LogoutButton from "../../components/LogoutButton";
import GroupLeaveButton from '../../components/GroupLeaveButton';
import ToggleEnableButton from '../../components/ToggleEnableButton';
import { TextField, Button, Box, Typography } from '@mui/material';
import * as styles from './settings.module.css';

function Settings() {
  const { user, groupInfo, jwt, setGroupInfo, groupId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupInfo?.name || '');

  useEffect(() => {
    setNewGroupName(groupInfo?.name || '');
    console.log(groupInfo);
  }, [groupInfo]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleGroupNameChange = (e) => {
    setNewGroupName(e.target.value);
  };

  const handleGroupNameSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ groupId: groupId, newGroupName: newGroupName })
      });

      if (!response.ok) {
        throw new Error('Failed to update group name');
      }

      const data = await response.json();
      setGroupInfo(prevGroupInfo => ({ ...prevGroupInfo, name: data.data.newName }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating group name:', error);
    }
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h4" gutterBottom>설정</Typography>
      <Box className={styles.groupName}>
        {user ? (
          <Box mb={3}>
            <Typography variant="h6"><strong>닉네임 : </strong> {user.name}</Typography>
            <Typography variant="h6"><strong>Email : </strong> {user.email}</Typography>
          </Box>
        ) : (
          <Typography>유저 정보 로딩중...</Typography>
        )}
        {isEditing ? (
          <form onSubmit={handleGroupNameSubmit} className={styles.form}>
            <TextField
              value={newGroupName}
              onChange={handleGroupNameChange}
              size="small"
            />
           <Button
  type="submit"
  variant="contained"
  sx={{
    backgroundColor: '#ee8097',
    color: 'white',
    '&:hover': {
      backgroundColor: '#d46b7f', // 호버 시 더 어두운 음영
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)', // 호버 시 약간의 그림자 추가
    },
  }}
>
  저장
</Button>

<Button
  variant="outlined"
  onClick={() => setIsEditing(false)}
  sx={{
    borderColor: '#f7d3db',
    color: '#ee8097',
    '&:hover': {
      backgroundColor: '#fbe5e9', // 호버 시 연한 핑크색 배경
      borderColor: '#f7d3db', // 테두리 색상 유지
      color: '#ee8097', // 텍스트 색상 유지
    },
  }}
>
  취소
</Button>
          </form>
        ) : (
          <Box display="flex" alignItems="center" gap="10px">
            <Typography variant="h6"><strong>그룹 이름 : </strong>{groupInfo?.name || '그룹명'}</Typography>
            {!isEditing && groupInfo?.isLeader && (
             <Button
             variant="contained"
             onClick={handleEditClick}
             style={{ backgroundColor: '#f19cac', color: 'white' }}  // 배경색과 텍스트 색상 지정
           >
             변경
           </Button>
            )}
          </Box>
        )}
      </Box>
      <Box className={styles.toggleSection}>
        <Typography variant="h6" className={styles.sectionTitle}><strong>기능 On/Off</strong></Typography>
        <ToggleEnableButton />
      </Box>
      <Box className={styles.logoutSection}>
        <Typography variant="h6" className={styles.sectionTitle}><strong>로그아웃</strong></Typography>
        <LogoutButton />
      </Box>
      <Box className={styles.leaveSection}>
        <Typography variant="h6" className={styles.sectionTitle}><strong>그룹 나가기</strong></Typography>
        <GroupLeaveButton />
      </Box>
    </Box>
  );
}

export default Settings;
