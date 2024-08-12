import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from './ModelViewer';
import useCharacter from './useCharacter';

const SIZE = 120;

const CharacterOverlay = () => {
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
    } = useCharacter(true, SIZE);

    const canvasRef = useRef(null);

    useEffect(() => {
        const handleCustomPlayAnimation = (event) => {
            const { animation, duration } = event.detail;
            let pauseTime = null;
            console.log('anim=',animation);
            // 'Death' 애니메이션의 경우 0.3초에 멈춤
            if (animation === 'Death') {
                pauseTime = 0.40;
            }

            playAnimation(animation, duration, pauseTime);
        };

        document.addEventListener('playAnimation', handleCustomPlayAnimation);
        return () => document.removeEventListener('playAnimation', handleCustomPlayAnimation);
    }, [playAnimation]);

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

    if (!isVisible) return null;

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
                {model && (
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
};

export default CharacterOverlay;