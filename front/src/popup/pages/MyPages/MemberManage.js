import { useState, useEffect } from "react";
import { useAuth } from "../../context/context";
import { Box, Button, Typography, List, ListItem, ListItemText, Snackbar, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

function MemberManage() {
  const { groupId, groupInfo, jwt, members, fetchMembers: originalFetchMembers } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // useEffect에서 fetchMembers 호출
  useEffect(() => {
    const loadMembers = async () => {
      if (groupId && jwt) {
        await originalFetchMembers(jwt, groupId);
      }
    };
    loadMembers();
  }, [groupId, jwt]);

  const handleGenerateInviteCode = async () => {
    if (!groupId) {
      console.error('Group ID is missing');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/code/${groupId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite code');
      }

      const data = await response.json();
      setInviteCode(data.data.inviteCode);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error generating invite code:', error);
    }
  };

  const handleKickMember = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to kick member');
      }

      // 멤버 리스트를 새로고침
      await originalFetchMembers(jwt, groupId);
    } catch (error) {
      console.error('Error kicking member:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
  };

  return (
    <Box p={3}>
      {groupInfo?.isLeader && (
        <Box mb={2}>
          <Button variant="contained" color="primary" onClick={handleGenerateInviteCode}>
            Generate Invite Code
          </Button>
          {inviteCode && (
            <Typography variant="body1" mt={2}>
              Invite Code: {inviteCode}
            </Typography>
          )}
        </Box>
      )}
      <Typography variant="h4" gutterBottom>
        스터디 구성원
      </Typography>
      <List>
        {members.map(member => (
          <ListItem key={member.memberId} divider>
            <ListItemText
              primary={`${member.nickname} ${member.isLeader ? '(스터디장)' : ''}`}
            />
            {groupInfo?.isLeader && !member.isLeader && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleKickMember(member.userId)}
              >
                Kick
              </Button>
            )}
          </ListItem>
        ))}
      </List>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Invite code generated successfully!"
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}

export default MemberManage;
