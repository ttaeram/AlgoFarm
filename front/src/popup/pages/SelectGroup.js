import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';

const BackgroundContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundImage: `url(${chrome.runtime.getURL('images/AlgoFarmBackground.png')})`, // 여기에 원하는 이미지 경로를 입력하세요
  backgroundSize: 'cover', // 이미지를 화면에 꽉 차게 설정
  backgroundPosition: 'center', // 이미지를 화면의 중앙에 배치
  backgroundRepeat: 'no-repeat', // 이미지 반복을 방지
});

const StyledPaper = styled(Paper)({
  padding: 16,
  maxWidth: 400,
  width: '100%',
  textAlign: 'center',
  backgroundColor: 'transparent',
  boxShadow: 'none', // 그림자 제거
});

const StyledTitle = styled(Typography)({
  marginBottom: 16,
  fontWeight: 'bold',
  color: '#6b4f4f',
  textAlign: 'center',
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%', // 컨테이너를 화면 가로 너비에 맞춤
  alignItems: 'center', // 아이템들을 중앙으로 정렬
});

const StyledButton = styled(Button)({
  width: '80%', // 버튼을 부모 컨테이너 기준으로 80% 너비로 설정
  backgroundColor: '#FD88A0',
  '&:hover': {
    backgroundColor: '#EB4A52',
  },
});

const OutlinedButton = styled(Button)(({ theme }) => ({
  width: '80%', // 버튼을 부모 컨테이너 기준으로 80% 너비로 설정
  borderColor: theme.palette.success.main,
  color: '#FD88A0',
  '&:hover': {
    borderColor: theme.palette.success.dark,
    color: '#EB4A52'
  },
}));

const SelectGroup = () => {
  const navigate = useNavigate();

  return (
    <BackgroundContainer>
      <StyledPaper>
        <StyledTitle variant="h4">알고팜</StyledTitle>
        <ButtonContainer>
          <StyledButton
            variant="contained"
            onClick={() => navigate('/create-group')}
          >
            그룹 생성
          </StyledButton>
          <OutlinedButton
            variant="outlined"
            onClick={() => navigate('/join-group')}
          >
            그룹 참가
          </OutlinedButton>
        </ButtonContainer>
      </StyledPaper>
    </BackgroundContainer>
  );
};

export default SelectGroup;
