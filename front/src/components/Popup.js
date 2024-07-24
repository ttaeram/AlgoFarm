import React, { useState, useEffect } from 'react';
import { signIn, getServerUserInfo, exchangeTokenForJwt, signOut } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import SelectGroup from '../pages/SelectGroup';
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

  // 사용자가 그룹에 속해있는지 확인하는 함수
  const isUserInGroup = () => {
    return user && user.groupId;  // 사용자 정보에 groupId가 있는지 확인
  };

  return (
    <div>
      {isLogined && user ? (
        isUserInGroup() ? (
          console.log("groupPage")  // 그룹에 속해있으면 그룹 메인 페이지로 이동
        ) : (
          <SelectGroup />  // 그룹에 속해있지 않으면 그룹 선택 페이지로 이동
        )
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
