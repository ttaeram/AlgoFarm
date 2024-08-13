import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/context';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { styled } from '@mui/system';
import * as styles from './GroupLeaveButton.module.css';

const CustomCancelButton = styled(Button)({
  backgroundColor: '#ffffff',
  color: '#FD88A0',
  '&:hover': {
    backgroundColor: '#FCE6E0',
  },
});

const CustomLeaveButton = styled(Button)({
  backgroundColor: '#FD88A0',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#EB4A52',
  },
});

const GroupLeaveButton = () => {
  const { jwt, setGroupId, groupId, disappearCharacter} = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
      navigate('/select-group');
    } catch (error) {
      console.error('Error leaving group:', error);
    } finally {
      handleClose(); // 팝업 닫기
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className={styles.groupLeaveButton}
        variant="contained"
        style={{ backgroundColor: '#eb647e' }}  // style 속성을 사용하여 배경색을 직접 지정
      >
        그룹탈퇴
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>그룹 탈퇴</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 그룹을 탈퇴하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CustomCancelButton onClick={handleClose}>
            취소
          </CustomCancelButton>
          <CustomLeaveButton onClick={handleLeaveGroup}>
            탈퇴
          </CustomLeaveButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupLeaveButton;
