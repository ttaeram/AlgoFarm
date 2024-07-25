import { Routes, Route, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';  // useAuth 훅을 import
import Nav from '../components/Navbar';
import GroupInfo from './myPages/GroupInfo';
import MemberInfo from './myPages/MemberInfo';
import CharInfo from './myPages/CharInfo';
import Settings from './myPages/Settings';
import Chat from './myPages/Chat';
import GroupLeaveButton from '../components/GroupLeaveButton';
import './MyPage.css';

const SERVER_URL = 'http://i11a302.p.ssafy.io:8080';

const MyPage = () => {
  const navigate = useNavigate();
  const { setIsLogined, groupInfo, jwt, setGroupInfo } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupInfo?.name || '');

  useEffect(() => {
    setNewGroupName(groupInfo?.name || '');
    console.log(groupInfo);
  }, [groupInfo]);

  const handleLogout = () => {
    setIsLogined(false);  // 로그인 상태를 false로 설정
    navigate('/');
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleGroupNameChange = (e) => {
    setNewGroupName(e.target.value);
  };

  const handleGroupNameSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${SERVER_URL}/api/groups`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ groupId: groupInfo.groupId, newGroupName: newGroupName })
      });

      if (!response.ok) {
        throw new Error('Failed to update group name');
      }

      const data = await response.json();
      setGroupInfo(prevGroupInfo => ({ ...prevGroupInfo, name: data.data.newName }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating group name:', error);
    }
  };

  return (
    <div className="container">
      <div className="topSection">
        <div className="headers">
          <div className="groupName">
            {isEditing ? (
              <form onSubmit={handleGroupNameSubmit}>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={handleGroupNameChange}
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              </form>
            ) : (
              <span>{groupInfo?.name || '그룹명'}</span>
            )}
            {!isEditing && <button onClick={handleEditClick}>Edit</button>}
          </div>
        </div>
        <div className="characterBox">
          <div className="character">캐릭터 150px*150px</div>
        </div>
        <Nav />
      </div>
      <div className="content">
        <Routes>
          <Route path="group-info" element={<GroupInfo />} />
          <Route path="member-info" element={<MemberInfo />} />
          <Route path="char-info" element={<CharInfo />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </div>
      <div className="chatIcon" onClick={toggleChat}>
        💬
      </div>
      {isChatOpen && <Chat onClose={toggleChat} />}
      <GroupLeaveButton />
      <button className="logoutButton" onClick={handleLogout}>로그아웃</button>
    </div>
  );
}

export default MyPage;
