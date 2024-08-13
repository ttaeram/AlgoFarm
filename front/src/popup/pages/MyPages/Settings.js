import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/context";
import LogoutButton from "../../components/LogoutButton";
import GroupLeaveButton from '../../components/GroupLeaveButton';
import WithdrawButton from '../../components/WithdrawButton';
import ToggleEnableButton from '../../components/ToggleEnableButton';
import { TextField, Button, Box, Typography, Divider, Switch, Snackbar, Alert } from '@mui/material';
import ToggleCharacterButton from '../../components/ToggleCharacterButton';
import { styled } from '@mui/system';
import * as styles from './settings.module.css';

const Container = styled(Box)`
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const GroupNameBox = styled(Box)`
  margin-bottom: 20px;
`;

const Form = styled('form')`
  display: flex;
  gap: 10px;
`;

const SaveButton = styled(Button)`
  background-color: #ee8097;
  color: white;

  &:hover {
    background-color: #d46b7f;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  }
`;

const CancelButton = styled(Button)`
  border-color: #f7d3db;
  color: #ee8097;

  &:hover {
    background-color: #fbe5e9;
    border-color: #f7d3db;
    color: #ee8097;
  }
`;

const EditButton = styled(Button)`
  background-color: #f19cac;
  color: white;

  &:hover {
    background-color: #e08394;
  }
`;

const SectionTitle = styled(Typography)`
  font-weight: bold;
`;

const SettingItem = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
`;

const SwitchItem = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
`;

function Settings() {
  const { user, groupInfo, jwt, setGroupInfo, groupId, fetchMembers, members, nickname, setNickname } = useAuth();
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupInfo?.name || '');
  const [newNickname, setNewNickname] = useState(nickname || '');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    setNewGroupName(groupInfo?.name || '');
    setNewNickname(nickname || '');
  }, [groupInfo, nickname]);

  const handleEditGroupNameClick = () => {
    setIsEditingGroupName(true);
  };

  const handleEditNicknameClick = () => {
    setIsEditingNickname(true);
  };

  const handleGroupNameChange = (e) => {
    setNewGroupName(e.target.value);
  };

  const handleNicknameChange = (e) => {
    setNewNickname(e.target.value);
  };

  const handleGroupNameSubmit = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setSnackbarMessage('그룹 이름을 입력하세요.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

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
      setIsEditingGroupName(false);
      setSnackbarMessage('그룹 이름이 성공적으로 변경되었습니다.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      // console.error('Error updating group name:', error);
      setSnackbarMessage('그룹 이름 변경에 실패했습니다.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleNicknameSubmit = async (e) => {
    e.preventDefault();
    if (!newNickname.trim()) {
      setSnackbarMessage('닉네임을 입력하세요.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/members/nickname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ newNickname: newNickname, groupId: groupId })
      });

      if (!response.ok) {
        throw new Error('Failed to update nickname');
      }

      setNickname(newNickname);
      setIsEditingNickname(false);
      setSnackbarMessage('닉네임이 성공적으로 변경되었습니다.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      await fetchMembers();
    } catch (error) {
      // console.error('Error updating nickname:', error);
      setSnackbarMessage('닉네임 변경에 실패했습니다.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <SectionTitle variant="h6" gutterBottom>계정 정보</SectionTitle>

      {user ? (
        <Box mb={3}>
          {isEditingNickname ? (
            <Form onSubmit={handleNicknameSubmit}>
              <TextField
                value={newNickname}
                onChange={handleNicknameChange}
                size="small"
              />
              <SaveButton type="submit" variant="contained">
                저장
              </SaveButton>
              <CancelButton variant="outlined" onClick={() => setIsEditingNickname(false)}>
                취소
              </CancelButton>
            </Form>
          ) : (
            <SettingItem>
              <Typography variant="body1"><strong>닉네임 : </strong> {nickname || '닉네임 없음'}</Typography>
              {!isEditingNickname && (
                <EditButton variant="contained" onClick={handleEditNicknameClick}>
                  변경
                </EditButton>
              )}
            </SettingItem>
          )}

          <SettingItem>
            <Typography variant="body1"><strong>Email : </strong> {user.email}</Typography>
          </SettingItem>
        </Box>
      ) : (
        <Typography>유저 정보 로딩중...</Typography>
      )}

      {isEditingGroupName ? (
        <Form onSubmit={handleGroupNameSubmit}>
          <TextField
            value={newGroupName}
            onChange={handleGroupNameChange}
            size="small"
          />
          <SaveButton type="submit" variant="contained">
            저장
          </SaveButton>
          <CancelButton variant="outlined" onClick={() => setIsEditingGroupName(false)}>
            취소
          </CancelButton>
        </Form>
      ) : (
        <SettingItem>
          <Typography variant="body1"><strong>그룹 이름 : </strong>{groupInfo?.name || '그룹명'}</Typography>
          {!isEditingGroupName && groupInfo?.isLeader && (
            <EditButton variant="contained" onClick={handleEditGroupNameClick}>
              변경
            </EditButton>
          )}
        </SettingItem>
      )}

      <Box mt={3} mb={3}>
        <SectionTitle variant="h6" gutterBottom>기능 On/Off</SectionTitle>
        <SwitchItem>
          <Typography variant="body1">풀이 기록</Typography>
          <ToggleEnableButton />
        </SwitchItem>
        <SwitchItem>
          <Typography variant="body1">캐릭터</Typography>
          <ToggleCharacterButton />
        </SwitchItem>
      </Box>
      <SettingItem>
        <SectionTitle variant="h6">그룹 나가기</SectionTitle>
        <GroupLeaveButton />
      </SettingItem>

      <SettingItem>
        <SectionTitle variant="h6">로그아웃</SectionTitle>
        <LogoutButton />
      </SettingItem>

      <SettingItem>
        <SectionTitle variant="h6">회원 탈퇴</SectionTitle>
        <WithdrawButton />
      </SettingItem>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Settings;
