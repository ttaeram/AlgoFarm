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
  width: 500,
  height: 500,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
});

const HeaderContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  marginBottom: 24,
  position: 'relative',
});

const StyledTitle = styled(Typography)({
  fontWeight: 'bold',
  color: '#FD88A0',
  textAlign: 'center',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
});

const ImageContainer = styled(Box)({
  width: 340,
  height: 210,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
  overflow: 'hidden',
  backgroundColor: 'white',
  borderRadius: 8,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
        <BackButton />
        <StyledTitle variant="h4">
          알고팜
        </StyledTitle>
      </HeaderContainer>

      <ImageContainer>
        <img
          src="images/logo.jpeg"
          alt="algoFarm"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </ImageContainer>

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
