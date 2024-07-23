import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [jwt, setJwt] = useState(localStorage.getItem('jwt'));
  const [isLogined, setIsLogined] = useState(!!localStorage.getItem('isLogined'));

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('jwt', jwt);
  }, [jwt]);

  useEffect(() => {
    localStorage.setItem('isLogined', isLogined);
  }, [isLogined]);

  const signOut = () => {
    setUser(null);
    setJwt(null);
    setIsLogined(false);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    localStorage.removeItem('isLogined');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, jwt, setJwt, isLogined, setIsLogined, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
