import { Routes, Route, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';  // useAuth 훅을 import
import Nav from '../components/Navbar';
import GroupInfo from './myPages/GroupInfo';
import MemberInfo from './myPages/MemberInfo';
import CharInfo from './myPages/CharInfo';
import Settings from './myPages/Settings';
import Chat from './myPages/Chat';
import GroupLeaveButton from '../components/GroupLeaveButton';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const { setIsLogined } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = () => {
    setIsLogined(false);  // 로그인 상태를 false로 설정
    navigate('/');
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="container">
      <div className="topSection">
        <div className="headers">
          <div className="groupName">그룹명</div>
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
