import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/context';
import BackButton from '../components/BackButton';
import { Box, Typography, Button, TextField, IconButton, Alert } from '@mui/material';
import { styled } from '@mui/system';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const StyledContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%', // 전체 너비를 유지하려면 이 값을 유지합니다.
  maxWidth: '500px', // 최대 너비를 500px로 고정합니다.
  minHeight: '500px', // 최소 높이를 500px로 설정해 크기 변경을 막습니다.
  height: 'auto', // 높이를 자동으로 설정해 maxWidth에 맞게 조정될 수 있게 합니다.
  borderRadius: 8,
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
  margin: '0 auto',
  backgroundImage: `url(${chrome.runtime.getURL('images/AlgoFarmNoCharacter.png')})`, // 여기에 원하는 이미지 경로를 입력하세요
  backgroundSize: 'cover', // 이미지를 화면에 꽉 차게 설정
  backgroundPosition: 'center', // 이미지를 화면의 중앙에 배치
  backgroundRepeat: 'no-repeat', // 이미지 반복을 방지
});


const HeaderContainer = styled(Box)({
  position: 'relative', // 부모 컨테이너가 상대 위치를 가지도록 설정
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  position: 'absolute', // 제목을 절대 위치로 고정
  top: '16px', // 상단으로부터 16px
  left: '50%', // 수평으로 중앙 정렬
  transform: 'translateX(-50%)', // 중앙 정렬 보정
  marginBottom: 24,
  padding: '16px 0', // 패딩 추가
});

const StyledTitle = styled(Typography)({
  position: 'absolute', // 제목을 절대 위치로 고정
  top: '16px', // 상단으로부터 16px
  left: '50%', // 수평으로 중앙 정렬
  transform: 'translateX(-50%)', // 중앙 정렬 보정
  fontWeight: 'bold',
  color: '#FD88A0',
  zIndex: 1, // 뒤로가기 버튼 위에 위치하도록 설정
});

const BackButtonContainer = styled(Box)({
  position: 'absolute',
  top: '16px', // 상단으로부터 16px
  left: '16px', // 왼쪽으로부터 16px
  zIndex: 2, // 다른 요소들 위에 위치하도록 설정
});

const StyledForm = styled('form')({
  width: '100%',
  maxWidth: '340px',
});

const FormRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 16,
  width: '100%',
});

const StyledTextField = styled(TextField)({
  flexGrow: 1,
});

const StyledButton = styled(Button)({
  marginBottom: 16,
  backgroundColor: '#FD88A0',
  '&:hover': {
      backgroundColor: '#EB4A52',
  },
});

const JoinGroup = () => {
  const [showCode, setShowCode] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const { jwt, setGroupId, fetchGroupInfo } = useAuth();
  const navigate = useNavigate();

  const toggleShowCode = () => {
    setShowCode(!showCode);
  };

  const handleInputChange = (e) => {
    setInviteCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);
    } else {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({ inviteCode })
        });

        if (!response.ok) {
          throw new Error('Failed to join group');
        }

        const data = await response.json();
        const newGroupId = data.data.groupId;
        setGroupId(newGroupId);

        await fetchGroupInfo(jwt, newGroupId);

        navigate('/my-page/group-info');
      } catch (error) {
        console.error('Error joining group:', error);
        setShowWarning(true);
        setTimeout(() => {
          setShowWarning(false);
        }, 3000);
      }
    }
  };

  return (
    <StyledContainer>
      <HeaderContainer>
        <BackButtonContainer>
          <BackButton />
        </BackButtonContainer>
        <StyledTitle variant="h4">
          알고팜
        </StyledTitle>
      </HeaderContainer>
      <StyledForm onSubmit={handleSubmit}>
        <FormRow>
          <Typography variant="h6" sx={{ marginRight: 2, whiteSpace: 'nowrap' }}>
            그룹 참가
          </Typography>
          <StyledTextField
            type={showCode ? 'text' : 'password'}
            value={inviteCode}
            onChange={handleInputChange}
            placeholder="초대 코드 입력"
            variant="outlined"
            fullWidth
          />
          <IconButton onClick={toggleShowCode}>
            {showCode ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </FormRow>

        <StyledButton
          variant="contained"
          type="submit"
          fullWidth
        >
          참가
        </StyledButton>
        {showWarning && (
          <Alert severity="warning">
            유효하지 않은 초대 코드입니다.
          </Alert>
        )}
      </StyledForm>
    </StyledContainer>
  );
};

export default JoinGroup;
