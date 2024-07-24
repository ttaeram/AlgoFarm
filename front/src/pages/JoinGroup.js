import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import './JoinGroup.css';

function JoinGroup() {
  const [showCode, setShowCode] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const toggleShowCode = () => {
    setShowCode(!showCode);
  };

  const handleInputChange = (e) => {
    setInviteCode(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inviteCode.trim() || inviteCode !== "VALID_CODE") {  // replace "VALID_CODE" with your actual validation logic
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);  // 3초 후에 경고 메시지 숨기기
    } else {
      // 유효한 초대 코드로 그룹 참가 로직 추가
      console.log('그룹 참가');
    }
  };

  return (
    <div className="joinGroup">
      <BackButton />
      <h1 className="title">알고팜</h1>
      <div className="algoFarm">
        <img src="path/to/placeholder/image.png" alt="algoFarm" />
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label" htmlFor="inviteCode">그룹 참가</label>
        <div className="inputContainer">
          <input
            className="input"
            type={showCode ? 'text' : 'password'}
            id="inviteCode"
            value={inviteCode}
            onChange={handleInputChange}
            placeholder="초대 코드 입력"
          />
          <button type="button" className="toggleButton" onClick={toggleShowCode}>
            {showCode ? '숨기기' : '보기'}
          </button>
        </div>
        <button className="button" type="submit">참가</button>
        <div className="warningContainer">
          {showWarning && <div className="warning">유효하지 않은 초대 코드입니다.</div>}
        </div>
      </form>
    </div>
  );
}

export default JoinGroup;
