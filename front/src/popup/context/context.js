import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_KEYS = {
  USER: 'user',
  JWT: 'jwt',
  IS_LOGINED: 'isLogined',
  GROUP_ID: 'groupId',
  GROUP_INFO: 'groupInfo',
  MEMBERS: 'members',
  NICKNAME: 'nickname',
};

// 로컬 스토리지에서 객체 가져오기 (크롬 확장 프로그램용)
const getObjectFromChromeStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result[key]);
    });
  });
};

// 로컬 스토리지에 객체 저장하기 (크롬 확장 프로그램용)
const setObjectToChromeStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
};

// 크롬 스토리지에서 객체 삭제하기 (크롬 확장 프로그램용)
const removeObjectFromChromeStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [isLogined, setIsLogined] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [nickname, setNicknameState] = useState(null);

  useEffect(() => {
    getObjectFromChromeStorage(STORAGE_KEYS.USER).then((storedUser) => {
      setUser(storedUser ? JSON.parse(storedUser) : null);
    });

    getObjectFromChromeStorage(STORAGE_KEYS.JWT).then((storedJwt) => {
      setJwt(storedJwt || null);
    });

    getObjectFromChromeStorage(STORAGE_KEYS.IS_LOGINED).then((storedIsLogined) => {
      setIsLogined(!!storedIsLogined);
    });

    getObjectFromChromeStorage(STORAGE_KEYS.GROUP_ID).then((storedGroupId) => {
      setGroupId(storedGroupId || null);
    });

    getObjectFromChromeStorage(STORAGE_KEYS.GROUP_INFO).then((storedGroupInfo) => {
      setGroupInfo(storedGroupInfo ? JSON.parse(storedGroupInfo) : null);
    });

    getObjectFromChromeStorage(STORAGE_KEYS.MEMBERS).then((storedMembers) => {
      setMembers(storedMembers ? JSON.parse(storedMembers) : []);
    });

    getObjectFromChromeStorage(STORAGE_KEYS.NICKNAME).then((storedNickname) => {
      setNicknameState(storedNickname || null);
    });
  }, []);

  const setNickname = (newNickname) => {
    setNicknameState(newNickname);

    if (user && members.length > 0) {
      const updateMembers = members.map(member =>
        member.userId === user.sub
        ? { ...member, nickname: newNickname }
        : member
      );
      setMembers(updateMembers);
    }
  };

  useEffect(() => {
    if (user && members.length > 0) {
      const userMember = members.find(member => member.userId === user.sub);
      if (userMember) {
        setNicknameState(userMember.nickname);
      } else {
        setNicknameState(null);
      }
    }
  }, [user, members])

  useEffect(() => {
    setObjectToChromeStorage(STORAGE_KEYS.USER, user ? JSON.stringify(user) : null);
  }, [user]);

  useEffect(() => {
    setObjectToChromeStorage(STORAGE_KEYS.JWT, jwt);
    if (jwt) {
      handleSaveJwt(jwt);
      setIsLogined(true);
      setObjectToChromeStorage(STORAGE_KEYS.IS_LOGINED, true);
    } else {
      handleDeleteJwt(STORAGE_KEYS.JWT);
      setIsLogined(false);
      removeObjectFromChromeStorage(STORAGE_KEYS.IS_LOGINED);
    }
  }, [jwt]);

  const handleSaveJwt = (jwt) => {
    const request = indexedDB.open('MyDatabase', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('MyStore')) {
        db.createObjectStore('MyStore', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('MyStore')) {
        db.close();
        indexedDB.deleteDatabase('MyDatabase');
        handleSaveJwt(jwt); // 데이터베이스 재생성 후 재시도
        return;
      }

      const transaction = db.transaction('MyStore', 'readwrite');
      const store = transaction.objectStore('MyStore');
      store.put({ id: 'jwt', value: jwt }).onsuccess = () => {
        console.log('Token saved to IndexedDB');
      };
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB', event);
    };
  };

  const handleDeleteJwt = (key) => {
    const request = indexedDB.open('MyDatabase', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('MyStore')) {
        db.close();
        indexedDB.deleteDatabase('MyDatabase');
        return;
      }

      const transaction = db.transaction('MyStore', 'readwrite');
      transaction.objectStore('MyStore').delete(key).onsuccess = () => {
        console.log('Token deleted from IndexedDB');
      };
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB', event);
    };
  };
  
  useEffect(() => {
    setObjectToChromeStorage(STORAGE_KEYS.IS_LOGINED, isLogined);
  }, [isLogined]);

  useEffect(() => {
    setObjectToChromeStorage(STORAGE_KEYS.GROUP_ID, groupId);
  }, [groupId]);

  useEffect(() => {
    setObjectToChromeStorage(STORAGE_KEYS.GROUP_INFO, groupInfo ? JSON.stringify(groupInfo) : null);
  }, [groupInfo]);

  useEffect(() => {
    setObjectToChromeStorage(STORAGE_KEYS.MEMBERS, members ? JSON.stringify(members) : null);
  }, [members]);

  useEffect(() => {
    setObjectToChromeStorage(STORAGE_KEYS.NICKNAME, nickname);
  }, [nickname]);

  //logout로직
  const signOut = () => {
    setUser(null);
    setJwt(null);
    setIsLogined(false);
    setGroupId(null);
    setGroupInfo(null);
    setMembers([]);
    setNickname(null);
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
          'Authorization': `Bearer ${jwt}`,
        },
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
          'Authorization': `Bearer ${jwt}`,
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
    <AuthContext.Provider value={{
      user,
      setUser,
      jwt,
      setJwt,
      isLogined,
      setIsLogined,
      groupId,
      setGroupId,
      groupInfo,
      setGroupInfo,
      members,
      setMembers,
      nickname,
      setNickname,
      fetchGroupInfo,
      fetchMembers,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);