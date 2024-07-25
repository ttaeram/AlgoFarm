import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, getServerUserInfo, exchangeTokenForJwt, signOut } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import './Popup.css';

const Popup = () => {
  const { user, setIsLogined, setUser, setJwt, isLogined, jwt, groupId, setGroupId, setGroupInfo, fetchGroupInfo, signOut: contextSignOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserGroupStatus = async () => {
      if (isLogined && jwt) {
        try {
          console.log('Checking group status for user:', user);
          const groupIdResponse = await fetchGroupId(jwt);
          console.log('Fetched group ID:', groupIdResponse);

          if (groupIdResponse !== -1 && groupIdResponse !== null) {
            setGroupId(groupIdResponse);
            await fetchGroupInfo(jwt, groupIdResponse);
            navigate('/my-page/group-info');
          } else {
            setGroupId(null);
            setGroupInfo(null);
            navigate('/select-group');
          }
        } catch (error) {
          console.error('Error checking group status:', error);
          setGroupId(null);
          setGroupInfo(null);
          navigate('/select-group');
        }
      }
    };

    checkUserGroupStatus();
  }, [isLogined, jwt, user, setGroupId, fetchGroupInfo, navigate]);

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
      console.log('Fetched group ID after sign-in:', groupIdResponse);

      if (groupIdResponse !== -1 && groupIdResponse !== null) {
        setGroupId(groupIdResponse);
        await fetchGroupInfo(serverJwt, groupIdResponse);
        navigate('/my-page/group-info');
      } else {
        setGroupId(null);
        setGroupInfo(null);
        navigate('/select-group');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setGroupId(null);
      setGroupInfo(null);
      navigate('/select-group');
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
      console.log('Group ID response:', data);
      return data.data.length > 0 ? data.data[0] : '-1';
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
