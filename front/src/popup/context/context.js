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
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  //토큰을 받아오고, 저장하는 곳
  useEffect(() => {
    if (jwt) {
      localStorage.setItem('jwt', jwt);
      handleSave(jwt);
    } else {
      localStorage.removeItem('jwt');
    }
  }, [jwt]);

  //jwt토큰이 존재하면 indexDB에 토큰을 저장하는 로직
  const handleSave = (jwt) => {
    const request = indexedDB.open('MyDatabase', 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('MyStore', { keyPath: 'id' });
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction('MyStore', 'readwrite');
        const store = transaction.objectStore('MyStore');
        store.put({ id: 'myData', value: jwt });

        transaction.oncomplete = () => {
            console.log('Data saved to IndexedDB');
        };
    };

    request.onerror = (event) => {
        console.error('Error opening IndexedDB', event);
    };
  };



  useEffect(() => {
    localStorage.setItem('isLogined', isLogined);
  }, [isLogined]);

  useEffect(() => {
    if (groupId) {
      localStorage.setItem('groupId', groupId);
    } else {
      localStorage.removeItem('groupId');
    }
  }, [groupId]);

  useEffect(() => {
    if (groupInfo) {
      localStorage.setItem('groupInfo', JSON.stringify(groupInfo));
    } else {
      localStorage.removeItem('groupInfo');
    }
  }, [groupInfo]);

  useEffect(() => {
    if (members) {
      localStorage.setItem('members', JSON.stringify(members));
    } else {
      localStorage.removeItem('members');
    }
  }, [members]);

  //logout로직
  const signOut = () => {
    setUser(null);
    setJwt(null);
    setIsLogined(false);
    setGroupId(null);
    setGroupInfo(null);
    setMembers([]);
  };

  const fetchGroupInfo = async (jwt, groupId) => {
    if (!isLogined || !groupId || groupId === -1) {
      console.warn('Invalid groupId or user not logged in');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/${groupId}`, {
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
    if (!isLogined || !groupId || groupId === -1) {
      console.warn('Invalid groupId or user not logged in');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/${groupId}/memberList`, {
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
