import React from "react";
import { useAuth } from "../../context/AuthContext";

function Settings() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Settings</h1>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {/* 다른 사용자 정보 추가 */}
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
}

export default Settings;
