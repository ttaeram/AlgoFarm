import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/context";
import { Button } from '@mui/material';
import * as styles from './WithdrawButton.module.css';

const WithdrawButton = () => {
  const { setIsLogined, jwt } = useAuth();
  const navigate = useNavigate();

  const handleWithdraw = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });

      if (response.ok) {
        setIsLogined(false);
        navigate('/');
      } else {
        console.log("회원탈퇴 중 오류가 발생했습니다:", response.status)
      }
    } catch (error) {
      console.log("회원탈퇴 중 네트워크 오류가 발생했습니다:", error);
    }
  };

  return (
    <Button
      className={styles.WithdrawButton}
      onClick={handleWithdraw}
      variant="contained"
      style={{ backgroundColor: '#eb647e' }}  // style 속성을 사용하여 배경색 지정
    >
      회원탈퇴
    </Button>
  );
}

export default WithdrawButton