import { Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import Nav from '../components/Navbar';
import GroupInfo from './MyPages/GroupInfo';
import MemberInfo from './MyPages/MemberInfo';
import MemberManage from './MyPages/MemberManage';
import Settings from './MyPages/Settings';
import Chat from './MyPages/Chat';
import Character from '../components/Character';
import * as styles from "./MyPage.module.css";
import { Box } from '@mui/material';
import { SmsOutlined } from '@mui/icons-material';

const MyPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.topSection}>
        <Box className={styles.characterBox}>
          <Character />
        </Box>
        <Nav />
      </Box>
      <Box className={styles.content}>
        <Routes>
          <Route path="group-info" element={<GroupInfo />} />
          <Route path="member-info" element={<MemberInfo />} />
          <Route path="member-manage" element={<MemberManage />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </Box>
      <Box className={styles.chatIcon} onClick={toggleChat}>
        {<SmsOutlined />}
      </Box>
      {isChatOpen && <Chat onClose={toggleChat} />}
    </Box>
  );
}

export default MyPage;
