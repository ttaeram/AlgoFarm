import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/context";
import GaugeBar from "./GaugeBar";

function MemberInfo() {
  const { groupId, jwt } = useAuth();
  const [contributions, setContributions] = useState([]);

  const fetchContributions = useCallback(async () => {
    try {
      const response = await fetch(`https://i11a302.p.ssafy.io/api/groups/contributions/${groupId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      });
      const data = await response.json();
      if (data.status === "100 CONTINUE" && Array.isArray(data.data)) {
        setContributions(data.data);
      } else {
        console.error("Failed to fetch contributions data:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch contributions data", error);
    }
  }, [groupId, jwt]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  return (
    <div>
      <h1>Member Info</h1>
      <div>
        {contributions.map((member, index) => (
          <div key={index}>
            <h3>{member.nickname}</h3>
            <GaugeBar label="Individual Contribution" value={member.individualContribution} />
            <GaugeBar label="Mascot Experience" value={member.mascotExperience} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemberInfo;
