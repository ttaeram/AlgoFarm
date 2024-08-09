import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/context';
import BackButton from '../components/BackButton';
import { Box, Typography, Button, TextField, Alert } from '@mui/material';
import { styled } from '@mui/system';
import CharacterChoice from '../components/CharacterChoice';

const StyledContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',          
  maxWidth: 500,          
  height: 500,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)',
  margin: '0 auto',       
});

const HeaderContainer = styled(Box)({
  position: 'relative',   // 상대 위치 지정
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginBottom: 24,
});

const StyledTitle = styled(Typography)({
  position: 'absolute',   // 절대 위치 지정
  left: '50%',            // 좌측 기준 50%
  transform: 'translateX(-50%)', // 중앙 정렬
  fontWeight: 'bold',
  color: '#FD88A0',
});

const BackButtonContainer = styled(Box)({
  position: 'absolute',
  left: 0,               // 왼쪽에 배치
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

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const { jwt, setGroupId, fetchGroupInfo } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || !selectedCharacter) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);
    } else {
      try {
        const mascotType = selectedCharacter.toUpperCase();
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({
            groupName,
            mascotType
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create group');
        }

        const data = await response.json();
        const newGroupId = data.data.groupId;
        setGroupId(newGroupId);

        await fetchGroupInfo(jwt, newGroupId);

        navigate('/my-page/group-info');
      } catch (error) {
        console.error('Error creating group:', error);
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

      <CharacterChoice onCharacterSelect={handleCharacterSelect} />

      <StyledForm onSubmit={handleSubmit}>
        <FormRow>
          <Typography variant="h6" sx={{ marginRight: 2, whiteSpace: 'nowrap' }}>
            그룹 이름
          </Typography>
          <StyledTextField
            type="text"
            value={groupName}
            onChange={handleInputChange}
            placeholder="생성할 그룹 이름을 입력하세요"
            variant="outlined"
            fullWidth
          />
        </FormRow>

        <StyledButton
          variant="contained"
          type="submit"
          fullWidth
        >
          그룹 생성
        </StyledButton>
        {showWarning && (
          <Alert severity="warning" sx={{ marginBottom: 16 }}>
            그룹 이름과 캐릭터를 선택하세요.
          </Alert>
        )}
      </StyledForm>
    </StyledContainer>
  );
};

export default CreateGroup;
