import { useState, useEffect } from "react";
import { useAuth } from "../../context/context";
import { Box, Typography, List, ListItem, ListItemText, Snackbar, IconButton, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import * as styles from './MemberManage.module.css';

const CustomButton = styled(Button)(({ theme }) => ({
  marginTop: '16px',
  backgroundColor: '#f19cac',  // 기본 배경색 (핑크)
  color: 'white',
  borderRadius: '6px',
  textShadow: '0 1px 0 rgba(0, 0, 0, 0.15)', // 텍스트에 가벼운 그림자
  transition: 'top 0.1s linear, box-shadow .1s linear, background-color 0.3s ease',

  '&:hover': {
    backgroundColor: '#e08394', // 호버 시 배경색
  },

  '&:active': {
    top: '6px', // 클릭 시 더 많이 눌리는 효과
    boxShadow: '0px 0px 0px #b26873', // 클릭 시 그림자 사라짐
    backgroundColor: '#c16f7c', // 클릭 시 더 어두운 배경색
  },

  '&:focus': {
    outline: 'none', // 포커스 시 아웃라인 제거
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
      const inviteCode = data.data.inviteCode;
      setInviteCode(inviteCode);
  
      // 클립보드에 초대코드 복사
      await navigator.clipboard.writeText(inviteCode);
      console.log('Invite code copied to clipboard:', inviteCode);
  
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
              onClick={() => handleKickMember(member.userId)}
              className={styles.kickButton}
              style={{ backgroundColor: '#eb647e' }}
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
            {/* 10px 높이의 빈 공간 */}
            <Box sx={{ height: '20px' }} />
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
        message="초대코드가 클립보드에 복사되었습니다."
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
