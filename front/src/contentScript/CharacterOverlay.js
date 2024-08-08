import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from './ModelViewer';
import useCharacterMovement from './useCharacterMovement';
import useCharacterDrag from './useCharacterDrag';

const SIZE = 120;

const CharacterOverlay = ({ initialVisibility }) => {
    const [isVisible, setIsVisible] = useState(initialVisibility);
    const [model, setModel] = useState(null);
    const [currentCharacter, setCurrentCharacter] = useState('Cat');
    const canvasRef = useRef(null);
    const modelLoadedRef = useRef(false);

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
        if (modelLoadedRef.current) return;
        fetch(chrome.runtime.getURL(`assets/models/${character}_Animations.glb`))
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                setModel(arrayBuffer);
                modelLoadedRef.current = true;
            });
    }, []);

    useEffect(() => {
        if (!modelLoadedRef.current) {
            loadModel(currentCharacter);
            modelLoadedRef.current = true;
        }
    }, [currentCharacter, loadModel]);

    useEffect(() => {
        const messageListener = (request, sender, sendResponse) => {
            if (request.action === "playAnimation") {
                setAnimation(request.animation);
                if (request.animation !== 'Death') {
                    setTimeout(() => setAnimation('Walk'), 3000);
                }
            } else if (request.action === "changeCharacter") {
                setCurrentCharacter(request.character);
                modelLoadedRef.current = false;
            } else if (request.action === "toggleCharacterVisibility") {
                setIsVisible(request.isVisible);
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
            <Canvas ref={canvasRef}>
                <OrbitControls enabled={false} />
                <ambientLight intensity={2} />
                <directionalLight color={0xffffff} intensity={3} position={[5, 5, 5]} />
                {model && (
                    <ModelViewer
                        modelData={model}
                        cameraDistanceFactor={0.5}
                        cameraHorizontalAngle={0}
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