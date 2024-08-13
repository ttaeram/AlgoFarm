import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/context";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { styled } from '@mui/system';
import * as styles from './WithdrawButton.module.css';

const CustomCancelButton = styled(Button)({
  backgroundColor: '#ffffff',
  color: '#FD88A0',
  '&:hover': {
    backgroundColor: '#FCE6E0',
  },
});

const CustomWithdrawButton = styled(Button)({
  backgroundColor: '#FD88A0',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#EB4A52',
  },
});

const WithdrawButton = () => {
  const { setIsLogined, jwt } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleWithdraw = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });

      if (response.ok) {
        setIsLogined(false);
        navigate('/');
      } else {
        console.log("회원탈퇴 중 오류가 발생했습니다:", response.status);
      }
    } catch (error) {
      console.log("회원탈퇴 중 네트워크 오류가 발생했습니다:", error);
    } finally {
      handleClose(); // 팝업 닫기
    }
  };

  return (
    <>
      <Button
        className={styles.WithdrawButton}
        onClick={handleOpen}
        variant="contained"
        style={{ backgroundColor: '#eb647e' }}  // style 속성을 사용하여 배경색 지정
      >
        회원탈퇴
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>회원 탈퇴</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CustomCancelButton onClick={handleClose}>
            취소
          </CustomCancelButton>
          <CustomWithdrawButton onClick={handleWithdraw}>
            탈퇴
          </CustomWithdrawButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WithdrawButton;
