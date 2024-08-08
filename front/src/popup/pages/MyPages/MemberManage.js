import { useState, useEffect } from "react";
import { useAuth } from "../../context/context";
import { Box, Typography, List, ListItem, ListItemText, Snackbar, IconButton, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import * as styles from './MemberManage.module.css';

const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: '16px',
  backgroundColor: '#76ff03',
  color: 'white',
  '&:hover': {
    backgroundColor: '#64dd17',
  },
}));

function MemberManage() {
  const { groupId, groupInfo, jwt, members, fetchMembers: originalFetchMembers } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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

      await originalFetchMembers(jwt, groupId);
    } catch (error) {
      console.error('Error kicking member:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h4" gutterBottom>
        스터디 구성원
      </Typography>
      <List className={styles.memberList}>
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
              className={styles.kickButton}
              >
                추방
              </Button>
            )}
          </ListItem>
        ))}
      </List>
      {groupInfo?.isLeader && (
        <Box>
          <CustomButton
            variant="contained"
            onClick={handleGenerateInviteCode}
          >
            초대 코드 생성
          </CustomButton>
          {inviteCode && (
            <Typography variant="body1" className={styles.inviteCodeText}>
              초대 코드 : {inviteCode}
            </Typography>
          )}
        </Box>
      )}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="초대코드가 생성되었습니다!"
        className={styles.snackbar}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar} className={styles.closeIcon}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}

export default MemberManage;
