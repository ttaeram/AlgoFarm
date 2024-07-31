import { useNavigate } from 'react-router-dom';
import * as styles from './SelectGroup.module.css';

const SelectGroup = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.selectGroup}>
      <h1 className={styles.title}>알고팜</h1>
      <div className={styles.algoFarm}>
        <img src="" alt="algoFarm" />
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={() => navigate('/create-group')}>그룹 생성</button>
        <button className={styles.button} onClick={() => navigate('/join-group')}>그룹 참가</button>
      </div>
    </div>
  );
}

export default SelectGroup;
