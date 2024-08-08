import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from '../../contentScript/ModelViewer';

const PopupCharacter = () => {
    const containerRef = useRef(null);
    const controlsRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [model, setModel] = useState(null);

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
        // 모델 로드
        fetch(chrome.runtime.getURL(`assets/models/Cat_Animations.glb`))
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                setModel(arrayBuffer);
            });
    }, []);

    // OrbitControls의 줌 제한 설정
    const handleControlsUpdate = () => {
        if (controlsRef.current) {
            // 최소 줌 거리 (더 멀리 볼 수 있음)
            controlsRef.current.minDistance = 1;
            // 최대 줌 거리 (더 가까이 볼 수 있음)
            controlsRef.current.maxDistance = 10;
            // 줌 속도 조절 (기본값은 1, 작을수록 줌 속도가 느려짐)
            controlsRef.current.zoomSpeed = 0.1;
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                // backgroundColor: 'black'
                backgroundImage: `url(${chrome.runtime.getURL('images/banner.png')})`,
            backgroundSize: 'cover', // 이미지가 전체를 덮도록 설정
            backgroundPosition: 'center', // 이미지가 중앙에 오도록 설정
            backgroundRepeat: 'no-repeat', // 이미지 반복 방지
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
                        cameraDistanceFactor={0.5}
                        cameraHorizontalAngle={0}
                        scale={3}
                        animation="Idle_A"
                        rotation={0}
                        pauseAnimation={false}
                        isPopup={true}
                    />
                )}
            </Canvas>
        </div>
    );
};

export default PopupCharacter;