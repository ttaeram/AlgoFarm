import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// 현재 환경이 Chrome 확장 프로그램인지 확인하는 함수
const isChromeExtension = () => {
  return typeof chrome !== "undefined" && typeof chrome.storage !== "undefined";
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [jwt, setJwt] = useState(localStorage.getItem('jwt'));
  const [isLogined, setIsLogined] = useState(!!localStorage.getItem('isLogined'));
  const [groupId, setGroupId] = useState(localStorage.getItem('groupId'));
  const [groupInfo, setGroupInfo] = useState(JSON.parse(localStorage.getItem('groupInfo')));
  const [members, setMembers] = useState(JSON.parse(localStorage.getItem('members')) || []);
  const [nickname, setNicknameState] = useState(null);

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
      if(isChromeExtension()) {
        setIsLogined(true); // 로그인 상태를 true로 설정
        chrome.storage.local.set({ isLogined: true });

        let value;
        getObjectFromChromeStorage('Enable')
          .then(result => {
            value = result;
            if((value == undefined) || value == true){//로그인했을때, chromelocalstorage에 해당 키가 없으면, true로 기본설정함.
              console.log("로그인내부에서 enable세팅을 했습니다.");
              setObjectToChromeStorage('Enable', true);
            }
          })
          .catch(error => {
            console.error('variable -value Error retrieving value:', error);
          })
        
          
        let showCharacter;
        getObjectFromChromeStorage('showCharacter')
          .then(result => {
            value = result;
            if((value == undefined) || showCharacter == true){//로그인했을때, chromelocalstorage에 해당 키가 없으면, true로 기본설정함.
              console.log("로그인내부에서 showCharacter를 세팅했습니다.");
              setObjectToChromeStorage('showCharacter', true);
            }
          })
          .catch(error => {
            console.error('variable-showCharacter Error retrieving value:', error);
          })
        const now = new Date();
        console.log(now + "로그인햇음니다.");
      } // 로그인 상태를 chrome.storage.local에 저장
      
    } else {
      localStorage.removeItem('jwt');
      handleDelete('jwt')
      if(isChromeExtension()) {
        setIsLogined(false); // 로그아웃 상태를 false로 설정
      chrome.storage.local.set({ isLogined: false });
      } // 로그아웃 상태를 chrome.storage.local에 저장
    }
  }, [jwt]);

  //login시 indexdb의 토큰 넣기
  const handleSave = (jwt) => {
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
        console.error('Object store "MyStore" not found. Database will be recreated.');
        handleSave(jwt); // 데이터베이스 재생성 후 재시도
        return;
      }
  
      const transaction = db.transaction('MyStore', 'readwrite');
      const store = transaction.objectStore('MyStore');
      const putRequest = store.put({ id: 'jwt', value: jwt });
  
      putRequest.onsuccess = () => {
        console.log('Token saved to IndexedDB');
        if(isChromeExtension()) {
        chrome.storage.local.set({ isLogined: true });
        }
      };
  
      putRequest.onerror = (event) => {
        console.error('Error saving token to IndexedDB', event);
      };
    };
  
    request.onerror = (event) => {
      console.error('Error opening IndexedDB', event);
    };
  };
  
  //로그아웃시 indexdb의 토큰삭제
  const handleDelete = (key) => {
    const request = indexedDB.open('MyDatabase', 1);
  
    request.onsuccess = (event) => {
      const db = event.target.result;
  
      if (!db.objectStoreNames.contains('MyStore')) {
        db.close();
        indexedDB.deleteDatabase('MyDatabase');
        console.error('Object store "MyStore" not found. Database will be recreated.');
        return;
      }
  
      const transaction = db.transaction('MyStore', 'readwrite');
      const store = transaction.objectStore('MyStore');
      const deleteRequest = store.delete(key);
  
      deleteRequest.onsuccess = () => {
        console.log('Token deleted from IndexedDB');
        // 로그아웃 상태를 저장
        if(isChromeExtension()) {
          chrome.storage.local.set({ isLogined: false });
        }
      };
  
      deleteRequest.onerror = (event) => {
        console.error('Error deleting token from IndexedDB', event);
        
      };
  
      transaction.oncomplete = () => {
        console.log('Transaction completed');
      };
  
      transaction.onerror = (event) => {
        console.error('Transaction error', event);
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

  useEffect(() => {
    if (nickname) {
      localStorage.setItem('nickname', nickname);
    } else {
      localStorage.removeItem('nickname');
    }
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
}

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
}

/*ToggleEnableButtons.js의 함수와 동일한 것을 사용 2024.08.08*/ 
// 로컬 스토리지에서 객체 가져오기 (웹 애플리케이션용)
const getObjectFromLocalStorage = (key) => {
  return Promise.resolve(localStorage.getItem(key));
}

// 로컬 스토리지에 객체 저장하기 (웹 애플리케이션용)
const setObjectToLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
  return Promise.resolve();
}
/*ToggleEnableButtons.js의 함수와 동일한 것을 사용 2024.08.08*/ 

  return (
    <AuthContext.Provider value={{ user, setUser, jwt, setJwt, isLogined, setIsLogined, groupId, setGroupId, groupInfo, setGroupInfo, members, setMembers, nickname, setNickname, fetchGroupInfo, fetchMembers, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
