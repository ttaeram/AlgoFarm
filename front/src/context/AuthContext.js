import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [jwt, setJwt] = useState(localStorage.getItem('jwt'));
  const [isLogined, setIsLogined] = useState(!!localStorage.getItem('isLogined'));
  const [groupId, setGroupId] = useState(localStorage.getItem('groupId'));
  const [groupInfo, setGroupInfo] = useState(JSON.parse(localStorage.getItem('groupInfo')));

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('jwt', jwt);
  }, [jwt]);

  useEffect(() => {
    localStorage.setItem('isLogined', isLogined);
  }, [isLogined]);

  useEffect(() => {
    localStorage.setItem('groupId', groupId);
  }, [groupId]);

  useEffect(() => {
    localStorage.setItem('groupInfo', JSON.stringify(groupInfo));
  }, [groupInfo]);

  const signOut = () => {
    setUser(null);
    setJwt(null);
    setIsLogined(false);
    setGroupId(null);
    setGroupInfo(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    localStorage.removeItem('isLogined');
    localStorage.removeItem('groupId');
    localStorage.removeItem('groupInfo');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, jwt, setJwt, isLogined, setIsLogined, groupId, setGroupId, groupInfo, setGroupInfo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
