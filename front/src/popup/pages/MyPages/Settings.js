import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/context";
import LogoutButton from "../../components/LogoutButton";
import GroupLeaveButton from '../../components/GroupLeaveButton';
import ToggleEnableButton from '../../components/ToggleEnableButton';
import { TextField, Button, Box, Typography, Container } from '@mui/material';

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
    <Box p={3} maxWidth="md">
      <Typography variant="h4" gutterBottom>설정</Typography>
      <Box mb={3} className="groupName">
      {user ? (
        <Box mb={3}>
          <Typography variant="h6"><strong>닉네임 : </strong> {user.name}</Typography>
          <Typography variant="h6"><strong>Email : </strong> {user.email}</Typography>
        </Box>
      ) : (
        <Typography>유저 정보 로딩중...</Typography>
      )}
        {isEditing ? (
          <form onSubmit={handleGroupNameSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TextField
              value={newGroupName}
              onChange={handleGroupNameChange}
              size="small"
            />
            <Button type="submit" variant="contained" color="primary">
              저장
            </Button>
            <Button variant="outlined" onClick={() => setIsEditing(false)}>
              취소
            </Button>
          </form>
        ) : (
          <Box display="flex" alignItems="center" gap="10px">
            <Typography variant="h6"><strong>그룹 이름 : </strong>{groupInfo?.name || '그룹명'}</Typography>
            {!isEditing && groupInfo?.isLeader && (
              <Button variant="contained" color="primary" onClick={handleEditClick}>
                변경
              </Button>
            )}
          </Box>
        )}
      </Box>
      <Box mb={3}>
        <Typography variant="h6"><strong>기능 On/Off</strong></Typography>
        <ToggleEnableButton />
      </Box>
      <Box mb={3}>
      <Typography variant="h6"><strong>로그아웃</strong></Typography>
        <LogoutButton />
      </Box>
      <Box>
      <Typography variant="h6"><strong>그룹 나가기</strong></Typography>
        <GroupLeaveButton />
      </Box>
    </Box>
  );
}

export default Settings;
