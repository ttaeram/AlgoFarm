import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/context';
import BackButton from '../components/BackButton';
import * as styles from "./JoinGroup.module.css";

function JoinGroup() {
  const [showCode, setShowCode] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const { jwt, setGroupId, fetchGroupInfo } = useAuth();
  const navigate = useNavigate();

  const toggleShowCode = () => {
    setShowCode(!showCode);
  };

  const handleInputChange = (e) => {
    setInviteCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
      }, 3000);  // 3초 후에 경고 메시지 숨기기
    } else {
      try {
        const response = await fetch('http://i11a302.p.ssafy.io:8080/api/groups/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({ inviteCode })
        });

        if (!response.ok) {
          throw new Error('Failed to join group');
        }

        const data = await response.json();
        const newGroupId = data.data.groupId;
        setGroupId(newGroupId);

        // 그룹 정보를 가져와서 Context에 저장
        await fetchGroupInfo(jwt, newGroupId);

        navigate('/my-page/group-info');  // 그룹 참가가 성공하면 MyPage로 이동
      } catch (error) {
        console.error('Error joining group:', error);
        setShowWarning(true);
        setTimeout(() => {
          setShowWarning(false);
        }, 3000);  // 3초 후에 경고 메시지 숨기기
      }
    }
  };

  return (
    <div className={styles.joinGroup}>
      <BackButton />
      <h1 className={styles.title}>알고팜</h1>
      <div className={styles.algoFarm}>
        <img src="" alt="algoFarm" />
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="inviteCode">그룹 참가</label>
        <div className={styles.inputContainer}>
          <input
            className={styles.input}
            type={showCode ? 'text' : 'password'}
            id="inviteCode"
            value={inviteCode}
            onChange={handleInputChange}
            placeholder="초대 코드 입력"
          />
          <button type="button" className={styles.toggleButton} onClick={toggleShowCode}>
            {showCode ? '숨기기' : '보기'}
          </button>
        </div>
        <button className={styles.button} type="submit">참가</button>
        <div className={styles.warningContainer}>
          {showWarning && <div className={styles.warning}>유효하지 않은 초대 코드입니다.</div>}
        </div>
      </form>
    </div>
  );
}

export default JoinGroup;
