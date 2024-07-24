import React, { useState } from 'react';
import BackButton from '../components/BackButton';  // BackButton 컴포넌트 import
import './CreateGroup.css';
import { useNavigate } from 'react-router-dom';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();  // useNavigate 훅을 사용

  const handleInputChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000); // 3초 후에 문구 숨기기
    } else {
      // 그룹 생성 로직 추가
      console.log('그룹 생성');
      navigate('/my-page/group-info');  // 그룹 생성이 성공하면 MyPage로 이동
    }
  };

  return (
    <div className="createGroup">
      <BackButton />
      <h1 className="title">알고팜</h1>
      <div className="algoFarm">
        <img src="path/to/placeholder/image.png" alt="algoFarm" />
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label" htmlFor="groupName">그룹 이름</label>
        <input
          className="input"
          type="text"
          id="groupName"
          placeholder="그룹 이름"
          value={groupName}
          onChange={handleInputChange}
        />
        <button className="button" type="submit">그룹 생성</button>
        <div className="warningContainer">
          {showWarning && <div className="warning">그룹 이름을 입력하세요.</div>}
        </div>
      </form>
    </div>
  );
}

export default CreateGroup;
