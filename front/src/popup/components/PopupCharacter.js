import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from '../../contentScript/ModelViewer';
import { isChromeExtension } from "../auth/auth";
import CharacterLevel from './CharacterLevel';
import { useAuth } from '../context/context'; // Import useAuth hook

const PopupCharacter = () => {
    const containerRef = useRef(null);
    const controlsRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [model, setModel] = useState(null);
    const [animationConfig, setAnimationConfig] = useState({ name: 'Idle_A', pauseAtTime: null });

    const { character } = useAuth(); // Get character from AuthContext

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setContainerSize({ width, height });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        if (isChromeExtension() && character && character.type) {
            fetch(chrome.runtime.getURL(`assets/models/${character.type}.glb`))
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    setModel(arrayBuffer);
                });
        }
    }, [character]);

    const handleControlsUpdate = () => {
        if (controlsRef.current) {
            controlsRef.current.minDistance = 1;
            controlsRef.current.maxDistance = 10;
            controlsRef.current.zoomSpeed = 0.1;
        }
    };

    const handleAnimationComplete = () => {
        console.log('Animation completed');
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                backgroundImage: `url(${chrome.runtime.getURL('images/banner.png')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <CharacterLevel
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    zIndex: 10,
                }}
            />

            <Canvas
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 5,
                }}
            >
                <OrbitControls
                    ref={controlsRef}
                    enablePan={false}
                    onUpdate={handleControlsUpdate}
                />
                <ambientLight intensity={2} />
                <directionalLight color={0xffffff} intensity={3} position={[5, 5, 5]} />
                {model && (
                    <ModelViewer
                        modelData={model}
                        animationConfig={animationConfig}
                        cameraDistanceFactor={0.5}
                        cameraHorizontalAngle={0}
                        scale={3}
                        rotation={0}
                        isPopup={true}
                        onAnimationComplete={handleAnimationComplete}
                    />
                )}
            </Canvas>
        </div>
    );
};

export default PopupCharacter;