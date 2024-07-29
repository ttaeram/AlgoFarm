import React, { useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from './ModelViewer';
import useCharacterMovement from './useCharacterMovement';
import useCharacterDrag from './useCharacterDrag';

const SIZE = 120;

const CharacterOverlay = () => {
  const [model, setModel] = useState(null);
  const {
    position,
    setPosition,
    direction,
    animation,
    setAnimation,
    speed,
    startDragging,
    stopDragging
  } = useCharacterMovement(SIZE);

  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp } = useCharacterDrag(
    SIZE,
    setPosition,
    startDragging,
    stopDragging
  );

  const handleAnimationComplete = useCallback(() => {
    if (animation === 'Death') {
      // After Death animation completes, wait for 2 seconds before resuming 'Walk'
      setTimeout(() => setAnimation('Walk'), 2000);
    }
  }, [animation, setAnimation]);

  useEffect(() => {
    fetch(chrome.runtime.getURL('assets/models/Cat_Animations.glb'))
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        setModel(arrayBuffer);
      });

    // Add message listener
    const messageListener = (request, sender, sendResponse) => {
      if (request.action === "playAnimation") {
        setAnimation(request.animation);
        if (request.animation !== 'Death') {
          setTimeout(() => setAnimation('Walk'), 3000);  // Return to 'Walk' after 3 seconds for non-Death animations
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [setAnimation]);

  const handleMouseDownWrapper = useCallback((e) => {
    e.stopPropagation();
    handleMouseDown(e);
  }, [handleMouseDown]);

  return (
    <div
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: `${SIZE}px`,
        height: `${SIZE}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDownWrapper}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Canvas>
        <OrbitControls enabled={false} />
        <ambientLight intensity={2} />
        <directionalLight color={0xffffff} intensity={3} position={[5, 5, 5]} />
        {model && (
          <ModelViewer
            modelData={model}
            scale={3}
            animation={animation}
            rotation={direction === 1 ? Math.PI / 2 + Math.PI / 4 : -Math.PI / 2 + Math.PI / 4}
            pauseAnimation={false}
            onAnimationComplete={handleAnimationComplete}
          />
        )}
      </Canvas>
    </div>
  );
};

export default CharacterOverlay;
