import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, getServerUserInfo, exchangeTokenForJwt, signOut } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import './Popup.css';

const Popup = () => {
  const { user, setIsLogined, setUser, setJwt, isLogined, groupId, setGroupId, groupInfo, setGroupInfo, fetchGroupInfo, signOut: contextSignOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      setGroupId(groupIdResponse);

      // 그룹 정보를 가져와서 Context에 저장
      await fetchGroupInfo(serverJwt, groupIdResponse);

      if (groupIdResponse && groupIdResponse !== '-1') {
        navigate('/my-page/group-info');
      } else {
        navigate('/select-group');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupId = async (jwt) => {
    try {
      const response = await fetch('http://i11a302.p.ssafy.io:8080/api/user/groups', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      const data = await response.json();
      return data.data[0];
    } catch (error) {
      console.error('Failed to fetch group ID:', error);
      return '-1';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      contextSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    if (isLogined) {
      if (groupId && groupId !== '-1') {
        navigate('/my-page/group-info');
      } else {
        navigate('/select-group');
      }
    }
  }, [isLogined, groupId, navigate]);

  return (
    <div>
      {isLogined && user ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <div className="login">
          <h1 className="title">알고팜</h1>
          <div className="algoFarm">
            <img src='' alt='algoFarm' />
          </div>
          <button onClick={handleSignIn} disabled={isLoading} className="loginButton">
            {isLoading ? 'Signing In...' : 'Sign In with Google'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Popup;
