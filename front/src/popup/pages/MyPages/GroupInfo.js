import { useEffect, useState } from "react";
import { useAuth } from "../../context/context";
import GrassGraph from "../../components/GrassGraph";
import { Box, Typography, CircularProgress } from '@mui/material';
import * as styles from './GroupInfo.module.css';

function GroupInfo() {
  const { groupId, jwt, members, fetchMembers, groupInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [grassData, setGrassData] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      if (groupId !== -1 && groupId !== null) {
        await fetchMembers(jwt, groupId);
      }
      setLoading(false);
    };

    const fetchGrassData = async () => {
      if (groupId !== -1 && groupId !== null) {
        try {
          const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/grassData/${groupId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch grass data');
          }

          const data = await response.json();
          setGrassData(data.data);
        } catch (error) {
          console.error('Error fetching grass data:', error);
        }
      }
    };

    loadMembers();
    fetchGrassData();
  }, [groupId, jwt]);

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (members.length === 0) {
    return (
      <Box className={styles.noMembersContainer}>
        <Typography variant="h6">구성원을 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      <GrassGraph data={grassData} />
    </Box>
  );
}

export default GroupInfo;
