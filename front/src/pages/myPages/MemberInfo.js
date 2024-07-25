import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function MemberInfo() {
  const { groupId, groupInfo, jwt } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerateInviteCode = async () => {
    if (!groupId) {
      console.error('Group ID is missing');
      return;
    }

    try {
      const response = await fetch(`http://i11a302.p.ssafy.io:8080/api/groups/code/${groupId}`, {
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

  return (
    <div>
      <h1>MemberInfo</h1>
      {groupInfo?.isLeader && (
        <div>
          <button onClick={handleGenerateInviteCode}>Generate Invite Code</button>
          {inviteCode && <p>Invite Code: {inviteCode}</p>}
          {showSuccess && <p>Invite code generated successfully!</p>}
        </div>
      )}
    </div>
  );
}

export default MemberInfo;
