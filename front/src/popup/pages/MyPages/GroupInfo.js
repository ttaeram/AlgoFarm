import { useEffect, useState } from "react";
import { useAuth } from "../../context/context";
import GrassGraph from "../../components/GrassGraph";

function GroupInfo() {
  const { groupId, jwt, members, fetchMembers } = useAuth();
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
    return <div>Loading...</div>;
  }

  if (members.length === 0) {
    return <div>No members found.</div>;
  }

  return (
    <div>
      <h1>GroupInfo</h1>
      <h2>Activity Streak</h2>
      <GrassGraph data={grassData} />
    </div>
  );
}

export default GroupInfo;
