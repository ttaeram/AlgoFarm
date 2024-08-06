import { Routes, Route, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/context';  // useAuth 훅을 import
import Nav from '../components/Navbar';
import GroupInfo from './MyPages/GroupInfo';
import MemberInfo from './MyPages/MemberInfo';
import MemberManage from './MyPages/MemberManage';
import Settings from './MyPages/Settings';
import Chat from './MyPages/Chat';
import ToggleEnableButton from '../components/ToggleEnableButton';
import * as styles from "./MyPage.module.css";

const MyPage = () => {
  const { groupInfo, jwt, setGroupInfo } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupInfo?.name || '');

  useEffect(() => {
    setNewGroupName(groupInfo?.name || '');
    console.log(groupInfo);
  }, [groupInfo]);

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
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ groupId: groupInfo.data.groupId, newGroupName: newGroupName })
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
    <div className={styles.container}>
      <div className={styles.topSection}>
        <div className={styles.headers}>
          <div className={styles.groupName}>
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
            {!isEditing && groupInfo?.isLeader && (
              <button onClick={handleEditClick}>Edit</button>
            )}
          </div>
          <ToggleEnableButton />
        </div>
        <div className={styles.characterBox}>
          <div className={styles.character}>캐릭터 150px*150px</div>
        </div>
        <Nav />
      </div>
      <div className={styles.content}>
        <Routes>
          <Route path="group-info" element={<GroupInfo />} />
          <Route path="member-info" element={<MemberInfo />} />
          <Route path="member-manage" element={<MemberManage />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </div>
      <div className={styles.chatIcon} onClick={toggleChat}>
        💬
      </div>
      {isChatOpen && <Chat onClose={toggleChat} />}
    </div>
  );
}

export default MyPage;
