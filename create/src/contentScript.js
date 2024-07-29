import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
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
      enableRotate={false}
    />
  );
};

const CharacterOverlay = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 2, y: 2 });
  const [rotationOffset, setRotationOffset] = useState(0);
  const [wallBounceRotation, setWallBounceRotation] = useState(Math.PI);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const currentRotation = useRef(0);  // 현재 회전 각도를 추적하기 위한 ref

  const handleRotationChange = (e) => {
    setRotationOffset(parseFloat(e.target.value));
  };
  const handleWallBounceRotationChange = (e) => {
    setWallBounceRotation(parseFloat(e.target.value));
  };
  const handleMouseDown = (e) => {
    isDragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      setPrevPosition(position);
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const updatePosition = useCallback(() => {
    if (!isDragging.current) {
      setPrevPosition(position);
      setPosition((prevPosition) => {
        let newX = prevPosition.x + velocity.x;
        let newY = prevPosition.y + velocity.y;
        let newVelocityX = velocity.x;
        let newVelocityY = velocity.y;
        let didBounce = false;

        if (newX <= 0 || newX >= window.innerWidth - 150) {
          newVelocityX = -newVelocityX;
          didBounce = true;
        }
        if (newY <= 0 || newY >= window.innerHeight - 150) {
          newVelocityY = -newVelocityY;
          didBounce = true;
        }

        if (didBounce) {
          // 벽에 부딪혔을 때 회전
          currentRotation.current += wallBounceRotation;
          // 회전 각도를 0~2π 범위 내로 유지
          currentRotation.current %= (2 * Math.PI);
        }

        setVelocity({ x: newVelocityX, y: newVelocityY });

        return { x: newX, y: newY };
      });
    }
  }, [velocity, position, wallBounceRotation]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    const intervalId = setInterval(updatePosition, 50);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      clearInterval(intervalId);
    };
  }, [updatePosition]);

  return (
    <div>
      <div
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: '150px',
          height: '150px',
          zIndex: 10000,
          cursor: 'move',
        }}
        onMouseDown={handleMouseDown}
      >
        <Canvas style={{ background: 'transparent' }}>
          <CameraController />
          <ambientLight intensity={5} />
          <directionalLight color={0xffffff} intensity={5}
                            position={[5, 5, 5]} />
          <Character
            currentPosition={position}
            prevPosition={prevPosition}
            rotationOffset={rotationOffset}
            currentRotation={currentRotation.current}
          />
        </Canvas>
      </div>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 10001,
        background: 'white',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <label>
          Rotation Offset:
          <input
            type="range"
            min="-3.14"
            max="3.14"
            step="0.01"
            value={rotationOffset}
            onChange={handleRotationChange}
          />
          {rotationOffset.toFixed(2)}
        </label>
        <br />
        <label>
          Wall Bounce Rotation:
          <input
            type="range"
            min="0"
            max="6.28"
            step="0.01"
            value={wallBounceRotation}
            onChange={handleWallBounceRotationChange}
          />
          {wallBounceRotation.toFixed(2)}
        </label>
      </div>
    </div>
  );
};

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<CharacterOverlay />, root);
