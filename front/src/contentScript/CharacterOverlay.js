import React, {useEffect, useState, useCallback} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import ModelViewer from './ModelViewer';
import useCharacterMovement from './useCharacterMovement';
import useCharacterDrag from './useCharacterDrag';

const SIZE = 120;

const CharacterOverlay = (initialVisibility ) => {
    const [isVisible, setIsVisible] = useState(initialVisibility);
    const [model, setModel] = useState(null);
    const [currentCharacter, setCurrentCharacter] = useState('Cat');
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

    const {isDragging, handleMouseDown, handleMouseMove, handleMouseUp} = useCharacterDrag(
        SIZE,
        setPosition,
        startDragging,
        stopDragging
    );

    const handleAnimationComplete = useCallback(() => {
        if (animation === 'Death') {
            setTimeout(() => setAnimation('Walk'), 2000);
        }
    }, [animation, setAnimation]);

    const loadModel = useCallback((character) => {
        fetch(chrome.runtime.getURL(`assets/models/${character}_Animations.glb`))
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                setModel(arrayBuffer);
            });
    }, []);

    useEffect(() => {
        loadModel(currentCharacter);
        const messageListener = (request, sender, sendResponse) => {
            if (request.action === "playAnimation") {
                setAnimation(request.animation);
                if (request.animation !== 'Death') {
                    setTimeout(() => setAnimation('Walk'), 3000);
                }
            } else if (request.action === "changeCharacter") {
                setCurrentCharacter(request.character);
                loadModel(request.character);
            } else if (request.action === "toggleVisibility") {
                setIsVisible(request.isVisible);
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);

        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, [setAnimation, loadModel]);

    const handleMouseDownWrapper = useCallback((e) => {
        e.stopPropagation();
        handleMouseDown(e);
    }, [handleMouseDown]);

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
            onMouseDown={handleMouseDownWrapper}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <Canvas>
                <OrbitControls enabled={false}/>
                <ambientLight intensity={2}/>
                <directionalLight color={0xffffff} intensity={3} position={[5, 5, 5]}/>
                {model && (
                    <ModelViewer
                        modelData={model}
                        cameraDistanceFactor={0.7} // 카메라와 모델의 거리 줄어들면 크게 보임
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
