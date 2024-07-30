import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Character from './Character';

const FIXED_CAMERA_POSITION = [-63, 132, -152];

const CameraController = () => {
  const { camera } = useThree();
  const controls = useRef();

  useEffect(() => {
    camera.position.set(...FIXED_CAMERA_POSITION);
  }, [camera]);

  useFrame(() => {
    if (controls.current) {
      controls.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableZoom={false}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
    />
  );
};

const Lights = () => {
  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[50, 50, 50]} intensity={1} />
      <pointLight position={[-50, -50, -50]} intensity={1} />
      <pointLight position={[50, -50, 50]} intensity={1} />
      <pointLight position={[-50, 50, -50]} intensity={1} />
    </>
  );
};

const App = () => {
  const [bgOpacity, setBgOpacity] = useState(0);
  const [popupOpacity, setPopupOpacity] = useState(1);

  useEffect(() => {
    // 팝업창의 투명도 설정
    document.body.style.background = `rgba(0, 0, 0, ${bgOpacity})`;
    document.body.style.opacity = popupOpacity;
  }, [bgOpacity, popupOpacity]);

  return (
    <div style={{ width: '350px', height: '300px', position: 'relative' }}>
      <Canvas style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}>
        <CameraController />
        <Lights />
        <Character />
      </Canvas>
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        color: 'white'
      }}>
        <span style={{ marginRight: '10px' }}>배경 투명도:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={bgOpacity}
          onChange={(e) => setBgOpacity(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        color: 'white'
      }}>
        <span style={{ marginRight: '10px' }}>팝업 투명도:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={popupOpacity}
          onChange={(e) => setPopupOpacity(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
    </div>
  );
};



export default App;
