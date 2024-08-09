import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from '../../contentScript/ModelViewer';
import { isChromeExtension } from "../auth/auth";

const PopupCharacter = () => {
    const containerRef = useRef(null);
    const controlsRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [model, setModel] = useState(null);
    const [animationConfig, setAnimationConfig] = useState({ name: 'Idle_A', pauseAtTime: null });

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
        if (isChromeExtension()) {
            fetch(chrome.runtime.getURL(`assets/models/Cat_Animations.glb`))
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    setModel(arrayBuffer);
                });
        }
    }, []);

    const handleControlsUpdate = () => {
        if (controlsRef.current) {
            controlsRef.current.minDistance = 1;
            controlsRef.current.maxDistance = 10;
            controlsRef.current.zoomSpeed = 0.1;
        }
    };

    const handleAnimationComplete = () => {
        // 애니메이션 완료 후 처리 로직
        console.log('Animation completed');
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${chrome.runtime.getURL('images/banner.png')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <Canvas>
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