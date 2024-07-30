import { useEffect, useState } from "react";
import { useAuth } from "../../context/context";

function GroupInfo() {
  const { groupId, jwt, members, fetchMembers } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      if (groupId) {
        await fetchMembers(jwt, groupId);
      }
      setLoading(false);
    };
    loadMembers();
  }, [groupId, jwt, fetchMembers]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (members.length === 0) {
    return <div>No members found.</div>;
  }

  return (
    <div>
      <h1>GroupInfo</h1>
      <h2>Group Members</h2>
      <ul>
        {members.map(member => (
          <li key={member.memberId}>
            {member.nickname} {member.isLeader && <strong>(스터디장)</strong>}
            {member.userId}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupInfo;
