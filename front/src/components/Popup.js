import React, { useState, useEffect } from 'react';
import { signIn, getServerUserInfo, exchangeTokenForJwt, signOut } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import './Popup.css';

const Popup = () => {
  const { user, setIsLogined, setUser, setJwt, isLogined, signOut: contextSignOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLogined(true);  // 로그인 성공 시 설정

    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
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
    if (!isLogined) {
      setUser(null);
      setJwt(null);
    }
  }, [isLogined, setUser, setJwt]);

  return (
    <div>
      {isLogined && user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <p>Email: {user.email}</p>
          <p>OAuth ID: {user.oAuthId}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
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
