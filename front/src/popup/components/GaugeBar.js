import React from 'react';

const GaugeBar = ({ contribution }) => {
  const percentage = Math.min(Math.max(contribution, 0), 100);

  return (
    <div style={{ width: '100%', backgroundColor: '#e0e0df', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        style={{
          width: `${percentage}%`,
          backgroundColor: '#76c7c0',
          height: '24px',
          borderRadius: '8px 0 0 8px',
          transition: 'width 0.3s ease-in-out'
        }}
      ></div>
    </div>
  );
};


export default GaugeBar;
