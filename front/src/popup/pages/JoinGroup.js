import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/context';
import BackButton from '../components/BackButton';
import { Box, Typography, Button, TextField, IconButton, Alert } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function JoinGroup() {
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 500,
        height: 500,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
   <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          mb: 3,
        }}
      >
        <BackButton/>
        <Typography
          variant="h4"
          sx={{ ml: 15, fontWeight: 'bold', color: '#4caf50', textAlign: 'center'}}
        >
          알고팜
        </Typography>
      </Box>

      <Box
        sx={{
          width: 340,
          height: 210,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          overflow: 'hidden',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <img
          src="images/logo.jpeg"
          alt="algoFarm"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Box>

      <form onSubmit={handleSubmit}>
        <Box
          display="flex"
          alignItems="center"
          mb={2}
          sx={{ width: '340px' }}
        >
          <Typography variant="h6" sx={{ mr: 2 }}>
            그룹 참가
          </Typography>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <TextField
              type={showCode ? 'text' : 'password'}
              value={inviteCode}
              onChange={handleInputChange}
              placeholder="초대 코드 입력"
              fullWidth
              variant="outlined"
            />
            <IconButton onClick={toggleShowCode}>
              {showCode ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="success"
          type="submit"
          fullWidth
          sx={{ mb: 1 }}
        >
          참가
        </Button>
        {showWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            유효하지 않은 초대 코드입니다.
          </Alert>
        )}
      </form>
    </Box>
  );
}

export default JoinGroup;
