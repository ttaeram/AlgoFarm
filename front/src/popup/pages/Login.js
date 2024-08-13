import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, getServerUserInfo, exchangeTokenForJwt } from '../auth/auth';
import { useAuth } from '../context/context';
import { styled } from '@mui/system';
import { Box, Paper, Typography, Button } from '@mui/material';
import * as styles from './Login.module.css'; // Assuming you have a CSS file for custom styles

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

const LoadingMessage = styled(Typography)({
  color: '#7c6a6a',
});

const StyledTitle = styled(Typography)({
  color: '#6b4f4f',
  fontWeight: 'bold',
  marginBottom: 16,
});

const StyledDescription = styled(Typography)({
  color: '#6b4f4f',
  marginBottom: 16,
});

const Popup = () => {
  const { user, setIsLogined, setUser, setJwt, isLogined, jwt, setGroupId, setGroupInfo, fetchGroupInfo, setCharacter, fetchCharacter } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserGroupStatus = async () => {
      if (isLogined && jwt) {
        try {
          const groupIdResponse = await fetchGroupId(jwt);

          if (groupIdResponse !== -1 && groupIdResponse !== null) {
            setGroupId(groupIdResponse);
            await fetchGroupInfo(jwt, groupIdResponse);
            await fetchCharacter(jwt, groupIdResponse);
            navigate('/my-page/group-info');
          } else {
            setGroupId(null);
            setGroupInfo(null);
            setCharacter(null);
            navigate('/select-group');
          }
        } catch (error) {
          setGroupId(null);
          setGroupInfo(null);
          setCharacter(null);
          navigate('/select-group');
        }
      }
    };

    checkUserGroupStatus();
  }, [isLogined, jwt, user, setGroupId, fetchGroupInfo, fetchCharacter, navigate]);

  const handleSignIn = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const googleToken = await signIn();
      const serverJwt = await exchangeTokenForJwt(googleToken);
      setJwt(serverJwt);

      const userInfo = await getServerUserInfo(serverJwt);
      setUser(userInfo);
      setIsLogined(true);

      const groupIdResponse = await fetchGroupId(serverJwt);

      if (groupIdResponse !== -1 && groupIdResponse !== null) {
        setGroupId(groupIdResponse);
        await fetchGroupInfo(serverJwt, groupIdResponse);
        await fetchCharacter(serverJwt, groupIdResponse);
        navigate('/my-page/group-info');
      } else {
        setGroupId(null);
        setGroupInfo(null);
        setCharacter(null);
        navigate('/select-group');
      }
    } catch (error) {
      setGroupId(null);
      setGroupInfo(null);
      setCharacter(null);
      navigate('/select-group');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupId = async (jwt) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/groups`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group ID');
      }

      const data = await response.json();

      if (!data || !data.data) {
        return '-1';
      }

      return data.data.length > 0 ? data.data[0] : '-1';
    } catch (error) {
      console.error('Error fetching group ID:', error);
      return '-1';
    }
  };

  return (
    <BackgroundContainer>
      <StyledPaper elevation={0}>
        {isLogined && user ? (
          <div className="loading">
            <LoadingMessage variant="h6">로딩 중...</LoadingMessage>
          </div>
        ) : (
          <div className="login">
            <StyledTitle variant="h4" component="h1" gutterBottom>
              반가워요!
            </StyledTitle>
            <StyledDescription variant="body1">
              알고팜과 함께 해요
            </StyledDescription>
            <Button color="success" variant="outlined" onClick={handleSignIn} disabled={isLoading} className={styles.oauthButton}>
            <svg className={styles.icon} viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                <path d="M1 1h22v22H1z" fill="none"></path>
            </svg>
            {isLoading ? 'Signing In...' : 'Sign In with Google'}
           </Button>
          </div>
        )}
      </StyledPaper>
    </BackgroundContainer>
  );
};

export default Popup;
