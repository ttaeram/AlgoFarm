import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
function GroupInfo() {
  const { groupId, jwt } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // const fetchMembers = async () => {
  //   try {
  //     const response = await fetch(`http://i11a302.p.ssafy.io:8080/api/groups/${groupId}/members`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${jwt}`
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch members');
  //     }

  //     const data = await response.json();
  //     setMembers(data.data);
  //   } catch (error) {
  //     console.error('Error fetching members:', error);
  //     setMembers(null); // 에러 발생 시 members를 null로 설정
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (groupId) {
  //     fetchMembers();
  //   }
  // }, [groupId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (members === null) {
    return <div>Failed to load members.</div>;
  }

  return (
    <div>
      <h1>GroupInfo</h1>
      <h2>Group Members</h2>
      <ul>
        {members.map(member => (
          <li key={member.id}>{member.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default GroupInfo;
