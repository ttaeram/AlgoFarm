import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [jwt, setJwt] = useState(localStorage.getItem('jwt'));
  const [isLogined, setIsLogined] = useState(!!localStorage.getItem('isLogined'));
  const [groupId, setGroupId] = useState(localStorage.getItem('groupId'));
  const [groupInfo, setGroupInfo] = useState(JSON.parse(localStorage.getItem('groupInfo')));
  const [members, setMembers] = useState(JSON.parse(localStorage.getItem('members')) || []);

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

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  const signOut = () => {
    setUser(null);
    setJwt(null);
    setIsLogined(false);
    setGroupId(null);
    setGroupInfo(null);
    setMembers([]);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    localStorage.removeItem('isLogined');
    localStorage.removeItem('groupId');
    localStorage.removeItem('groupInfo');
    localStorage.removeItem('members');
  };

  const fetchGroupInfo = async (jwt, groupId) => {
    if (!groupId || groupId === -1) {
      console.warn('Invalid groupId:', groupId);
      return;
    }
    
    try {
      const response = await fetch(`http://i11a302.p.ssafy.io:8080/api/groups/${groupId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch group info');
      }
      const data = await response.json();
      setGroupInfo(data.data);
    } catch (error) {
      console.error('Failed to fetch group info:', error);
    }
  };

  const fetchMembers = async (jwt, groupId) => {
    if (!groupId || groupId === -1) {
      console.warn('Invalid groupId:', groupId);
      return;
    }

    try {
      const response = await fetch(`http://i11a302.p.ssafy.io:8080/api/groups/${groupId}/memberList`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, jwt, setJwt, isLogined, setIsLogined, groupId, setGroupId, groupInfo, setGroupInfo, members, fetchGroupInfo, fetchMembers, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
