import { useNavigate } from 'react-router-dom';
import * as styles from './BackButton.module.css';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button className={styles.backButton} onClick={handleBack}>
      뒤로가기
    </button>
  );
};

export default BackButton;
