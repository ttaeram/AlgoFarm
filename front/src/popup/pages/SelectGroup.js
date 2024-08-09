import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';

const StyledContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: 500,
  height: 500,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
});

const StyledTitle = styled(Typography)({
  marginBottom: 16,
  fontWeight: 'bold',
  color: '#FD88A0',
  textAlign: 'center',
});

const ImageContainer = styled(Paper)({
  width: 340,
  height: 210,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
  overflow: 'hidden',
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '340px',
});

const StyledButton = styled(Button)({
  width: '100%',
  backgroundColor: '#FD88A0',
  '&:hover': {
    backgroundColor: '#EB4A52',
  },
});

const OutlinedButton = styled(Button)(({ theme }) => ({
  width: '100%',
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
    <StyledContainer>
      <StyledTitle variant="h4">알고팜</StyledTitle>

      <ImageContainer>
        <img
          src="images/logo.jpeg"
          alt="algoFarm"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </ImageContainer>

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
    </StyledContainer>
  );
};

export default SelectGroup;
