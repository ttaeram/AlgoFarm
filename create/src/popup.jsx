import React from 'react';
import ReactDOM from 'react-dom';

const animations = [
  'Attack', 'Bounce', 'Clicked', 'Death', 'Eat', 'Fear', 'Fly', 'Hit',
  'Idle_A', 'Idle_B', 'Idle_C', 'Jump', 'Roll', 'Run', 'Sit', 'Spin', 'Swim', 'Walk'
];

const Popup = () => {
  const playAnimation = (animationName) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "playAnimation", animation: animationName});
    });
  };

  return (
    <div style={{width: '300px', padding: '20px'}}>
      <h2 style={{marginBottom: '15px'}}>Select an Animation</h2>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px'}}>
        {animations.map((anim) => (
          <button
            key={anim}
            onClick={() => playAnimation(anim)}
            style={{
              padding: '8px',
              border: 'none',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e0e0e0'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f0f0f0'}
          >
            {anim}
          </button>
        ))}
      </div>
    </div>
  );
};

ReactDOM.render(<Popup />, document.getElementById('root'));
