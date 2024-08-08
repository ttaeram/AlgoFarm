import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/context';
import GaugeBar from '../../components/GaugeBar';
import { Typography, Box, Container } from '@mui/material';
import * as styles from './MemberInfo.module.css';

const GroupContributions = () => {
  const { jwt, groupId, members, fetchMembers } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [mascotExperience, setMascotExperience] = useState(0);

  useEffect(() => {
    const loadMembers = async () => {
      if (jwt && groupId && groupId !== -1) {
        await fetchMembers(jwt, groupId);
      }
    };
    loadMembers();
  }, [jwt, groupId]);

  useEffect(() => {
    const fetchContributions = async () => {
      if (groupId && groupId !== -1) {
        try {
          const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/contributions/${groupId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch contributions');
          }

          const data = await response.json();
          if (data.status === 'OK') {
            setContributions(data.data);
            if (data.data.length > 0) {
              setMascotExperience(data.data[0].mascotExperience);
            }
          }
        } catch (error) {
          console.error('Error fetching contributions:', error);
        }
      }
    };

    fetchContributions();
  }, [groupId, jwt]);

  const combinedData = members.map(member => {
    const contribution = contributions.find(c => c.nickname === member.nickname);
    return {
      nickname: member.nickname,
      individualContribution: contribution ? contribution.individualContribution : 0,
      mascotExperience: contribution ? contribution.mascotExperience : 0,
    };
  });

  return (
    <Container className={styles.container}>
      <Typography variant="h4" gutterBottom>
        스터디 구성원 기여도
      </Typography>
      <Typography variant="h5" className={styles.mascotExperience}>
        캐릭터 경험치: {mascotExperience}
      </Typography>
      {combinedData.map(member => (
        <Box key={member.nickname} className={styles.memberBox}>
          <Typography variant="h6">{member.nickname}</Typography>
          <GaugeBar contribution={member.individualContribution} maxExperience={mascotExperience} />
        </Box>
      ))}
    </Container>
  );
};

export default GroupContributions;
