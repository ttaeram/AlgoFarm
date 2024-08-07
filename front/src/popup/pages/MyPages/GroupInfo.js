import { useEffect, useState } from "react";
import { useAuth } from "../../context/context";
import GrassGraph from "../../components/GrassGraph";
import { Box, Typography, CircularProgress } from '@mui/material';

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
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="white">
        <CircularProgress />
      </Box>
    );
  }

  if (members.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="white">
        <Typography variant="h6">No members found.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} bgcolor="white">
      <Typography variant="h4" gutterBottom>그룹 이름</Typography>
      <Typography variant="h5" gutterBottom>스터디 스트릭</Typography>
      <GrassGraph data={grassData} />
    </Box>
  );
}

export default GroupInfo;
