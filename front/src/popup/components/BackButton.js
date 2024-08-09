import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/system';

const CustomButton = styled(Button)({
  backgroundColor: '#FD88A0', // 커스텀 배경색
  color: '#ffffff',           // 커스텀 텍스트 색상
  '&:hover': {
    backgroundColor: '#EB4A52', // 호버 상태에서의 배경색
  },
});

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <CustomButton
      variant="contained"
      startIcon={<ArrowBack />}
      onClick={handleBack}
    >
      뒤로가기
    </CustomButton>
  );
};

export default BackButton;
