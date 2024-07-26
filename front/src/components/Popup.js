import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, getServerUserInfo, exchangeTokenForJwt } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import * as styles from "./Popup.module.css";

const Popup = () => {
  const { user, setIsLogined, setUser, setJwt, isLogined, jwt, setGroupId, setGroupInfo, fetchGroupInfo } = useAuth();
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
            navigate('/my-page/group-info');
          } else {
            setGroupId(null);
            setGroupInfo(null);
            navigate('/select-group');
          }
        } catch (error) {
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
      return data.data.length > 0 ? data.data[0] : '-1';
    } catch (error) {
      return '-1';
    }
  };

  return (
    <div>
      {isLogined && user ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : (
        <div className={styles.login}>
          <h1 className={styles.title}>알고팜</h1>
          <div className={styles.algoFarm}>
            <img src='' alt='algoFarm' />
          </div>
          <button onClick={handleSignIn} disabled={isLoading} className={styles.loginButton}>
            {isLoading ? 'Signing In...' : 'Sign In with Google'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Popup;
