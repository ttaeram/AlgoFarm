import React, { useState, useCallback, useEffect, useRef } from 'react';
import CharacterOverlay from '../../contentScript/CharacterOverlay';

const Character = () => {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [characterSize, setCharacterSize] = useState(100);
    const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });

    // 컨테이너 크기 측정 및 캐릭터 크기 조정
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setContainerSize({ width, height });
                const newSize = Math.min(width, height) * 0.6; // 컨테이너의 60%로 설정
                setCharacterSize(newSize);
                // 초기 위치 설정 (중앙 하단)
                setCharacterPosition({
                    x: (width - newSize) / 2,
                    y: height - newSize
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // 캐릭터 위치 변경 처리
    const handlePositionChange = useCallback((newPosition) => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            // x 위치 제한
            const x = Math.max(0, Math.min(newPosition.x, width - characterSize));
            // y 위치 제한 (하단에서만 움직이도록)
            const y = Math.max(height - characterSize, Math.min(newPosition.y, height - characterSize));
            setCharacterPosition({ x, y });
        }
    }, [characterSize]);

    // 애니메이션 변경 처리
    const handleAnimationChange = useCallback((newAnimation) => {
        console.log('Character animation changed:', newAnimation);
        // 필요한 경우 여기에 추가 로직 구현
    }, []);

    // 캐릭터 변경 처리
    const handleCharacterChange = useCallback((newCharacter) => {
        console.log('Character changed:', newCharacter);
        // 필요한 경우 여기에 추가 로직 구현
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: 'black' // 배경색 추가
            }}
        >
            <CharacterOverlay
                initialVisibility={true}
                size={characterSize}
                onPositionChange={handlePositionChange}
                onAnimationChange={handleAnimationChange}
                onCharacterChange={handleCharacterChange}
                style={{
                    position: 'absolute',
                    top: characterPosition.y,
                    left: characterPosition.x,
                    transition: 'top 0.3s, left 0.3s', // 부드러운 이동을 위한 트랜지션
                }}
            />
        </div>
    );
};

export default Character;