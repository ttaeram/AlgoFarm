import { useState } from 'react';
import { useAuth } from '../context/context';
import BackButton from '../components/BackButton';  // BackButton 컴포넌트 import
import { useNavigate } from 'react-router-dom';
import * as styles from "./CreateGroup.module.css";

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const { jwt, setGroupId, fetchGroupInfo } = useAuth();
  const navigate = useNavigate();  // useNavigate 훅을 사용

  const handleInputChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000); // 3초 후에 문구 숨기기
    } else {
      try {
        const response = await fetch('http://i11a302.p.ssafy.io:8080/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({ groupName })
        });

        if (!response.ok) {
          throw new Error('Failed to create group');
        }

        const data = await response.json();
        const newGroupId = data.data.groupId;
        setGroupId(newGroupId); // 그룹 ID를 설정

        // 그룹 정보를 가져와서 Context에 저장
        await fetchGroupInfo(jwt, newGroupId);

        navigate('/my-page/group-info');  // 그룹 생성이 성공하면 MyPage로 이동
      } catch (error) {
        console.error('Error creating group:', error);
        setShowWarning(true);
        setTimeout(() => {
          setShowWarning(false);
        }, 3000); // 3초 후에 문구 숨기기
      }
    }
  };

  return (
    <div className={styles.createGroup}>
      <BackButton />
      <h1 className={styles.title}>알고팜</h1>
      <div className={styles.algoFarm}>
        <img src="" alt="algoFarm" />
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="groupName">그룹 이름</label>
        <input
          className={styles.input}
          type="text"
          id="groupName"
          placeholder="그룹 이름"
          value={groupName}
          onChange={handleInputChange}
        />
        <button className={styles.button} type="submit">그룹 생성</button>
        <div className={styles.warningContainer}>
          {showWarning && <div className={styles.warning}>그룹 이름을 입력하세요.</div>}
        </div>
      </form>
    </div>
  );
}

export default CreateGroup;
