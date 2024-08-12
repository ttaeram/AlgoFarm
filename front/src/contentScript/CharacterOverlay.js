import React, { useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from './ModelViewer';
import useCharacter from './useCharacter';

const SIZE = 120;

const CharacterOverlay = React.memo(() => {
    const {
        isVisible,
        model,
        currentCharacter,
        position,
        direction,
        animationConfig,
        isDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleAnimationComplete,
        playAnimation,
        changeCharacter,
    } = useCharacter(SIZE);

    const canvasRef = useRef(null);

    const handleCustomPlayAnimation = useCallback((event) => {
        const { animation, duration } = event.detail;
        let pauseTime = animation === 'Death' ? 0.40 : null;
        playAnimation(animation, duration, pauseTime);
    }, [playAnimation]);

    useEffect(() => {
        document.addEventListener('playAnimation', handleCustomPlayAnimation);
        return () => document.removeEventListener('playAnimation', handleCustomPlayAnimation);
    }, [handleCustomPlayAnimation]);

    useEffect(() => {
        const messageListener = (request, sender, sendResponse) => {
            if (request.action === "playAnimation") {
                playAnimation(request.animation);
            } else if (request.action === "changeCharacter") {
                changeCharacter(request.character);
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);
        return () => chrome.runtime.onMessage.removeListener(messageListener);
    }, [playAnimation, changeCharacter]);

    if (!isVisible || !currentCharacter) return null;

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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <Canvas ref={canvasRef}>
                <OrbitControls enabled={false} />
                <ambientLight intensity={2} />
                <directionalLight color={0xffffff} intensity={3} position={[5, 5, 5]} />
                {model && currentCharacter && (
                    <ModelViewer
                        modelData={model}
                        animationConfig={animationConfig}
                        cameraDistanceFactor={0.5}
                        cameraHorizontalAngle={0}
                        scale={3}
                        rotation={direction === 1 ? Math.PI / 2 + Math.PI / 4 : -Math.PI / 2 + Math.PI / 4}
                        onAnimationComplete={handleAnimationComplete}
                    />
                )}
            </Canvas>
        </div>
    );
});

export default CharacterOverlay;