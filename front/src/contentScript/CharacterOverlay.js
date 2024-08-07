import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from './ModelViewer';
import useCharacter from './useCharacter';

const CharacterOverlay = ({
                              initialVisibility = true,
                              size = 120,
                              onPositionChange,
                              onAnimationChange,
                              onCharacterChange,
                              style,
                          }) => {
    const {
        isVisible,
        model,
        currentCharacter,
        position,
        direction,
        animation,
        isDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleAnimationComplete,
    } = useCharacter(initialVisibility, size);

    React.useEffect(() => {
        if (onPositionChange) {
            onPositionChange(position);
        }
    }, [position, onPositionChange]);

    React.useEffect(() => {
        if (onAnimationChange) {
            onAnimationChange(animation);
        }
    }, [animation, onAnimationChange]);

    React.useEffect(() => {
        if (onCharacterChange) {
            onCharacterChange(currentCharacter);
        }
    }, [currentCharacter, onCharacterChange]);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                width: `${size}px`,
                height: `${size}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                pointerEvents: 'auto',
                ...style,
            }}
            onMouseDown={handleMouseDown}
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
                        cameraDistanceFactor={0.7}
                        cameraHorizontalAngle={30}
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