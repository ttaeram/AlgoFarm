import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/context";

function MemberManage() {
  const { groupId, groupInfo, jwt, members, fetchMembers: originalFetchMembers } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchMembers = useCallback(async (jwt, groupId) => {
    await originalFetchMembers(jwt, groupId);
  }, [originalFetchMembers]);

  useEffect(() => {
    if (groupId && jwt) {
      fetchMembers(jwt, groupId);
    }
  }, [groupId, jwt, fetchMembers]);

  const handleGenerateInviteCode = async () => {
    if (!groupId) {
      console.error('Group ID is missing');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/code/${groupId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite code');
      }

      const data = await response.json();
      setInviteCode(data.data.inviteCode);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);  // 3초 후에 성공 메시지 숨기기
    } catch (error) {
      console.error('Error generating invite code:', error);
    }
  };

  const handleKickMember = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to kick member');
      }

      // 멤버 리스트를 새로고침
      await fetchMembers(jwt, groupId);
    } catch (error) {
      console.error('Error kicking member:', error);
    }
  };

  return (
    <div>
      <h1>MemberManage</h1>
      {groupInfo?.isLeader && (
        <div>
          <button onClick={handleGenerateInviteCode}>Generate Invite Code</button>
          {inviteCode && <p>Invite Code: {inviteCode}</p>}
          {showSuccess && <p>Invite code generated successfully!</p>}
        </div>
      )}
      <h2>Group Members</h2>
      <ul>
        {members.map(member => (
          <li key={member.memberId}>
            {member.nickname} {member.isLeader && <strong>(스터디장)</strong>}
            {groupInfo?.isLeader && !member.isLeader && (
              <button onClick={() => handleKickMember(member.userId)}>Kick</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MemberManage;
