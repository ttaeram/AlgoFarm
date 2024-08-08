import { useState, useEffect, useRef, useCallback } from 'react';

const useCharacter = (initialVisibility = true, size = 120) => {
    const [isVisible, setIsVisible] = useState(initialVisibility);
    const [model, setModel] = useState(null);
    const [currentCharacter, setCurrentCharacter] = useState('Cat');
    const [position, setPosition] = useState({ x: window.innerWidth - 220, y: window.innerHeight - 220 });
    const [direction, setDirection] = useState(1);
    const [animation, setAnimation] = useState('Walk');
    const [speed, setSpeed] = useState(2);
    const [isJumping, setIsJumping] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const animationRef = useRef();
    const moveIntervalRef = useRef();
    const jumpRef = useRef();

    const cancelCurrentMovement = useCallback(() => {
        clearTimeout(animationRef.current);
        clearInterval(moveIntervalRef.current);
    }, []);

    const moveCharacter = useCallback(() => {
        if (isDragging) return;

        cancelCurrentMovement();

        const duration = Math.random() * 2000 + 1000;
        const newDirection = Math.random() < 0.5 ? -1 : 1;
        const newAnimation = Math.random() < 0.6 ? 'Walk' : Math.random() < 0.8 ? 'Run' : 'Sit';
        const newSpeed = newAnimation === 'Run' ? 4 : 2;

        setDirection(newDirection);
        setAnimation(newAnimation);
        setSpeed(newSpeed);

        moveIntervalRef.current = setInterval(() => {
            if (!isJumping && newAnimation !== 'Sit' && !isDragging) {
                setPosition(prevPos => {
                    let newX = prevPos.x + newDirection * newSpeed;
                    if (newX <= 0 || newX >= window.innerWidth - size) {
                        cancelCurrentMovement();
                        moveCharacter();
                        return prevPos;
                    }
                    return { ...prevPos, x: newX };
                });
            }
        }, 16);

        if (Math.random() < 0.2 && newAnimation !== 'Sit') {
            setTimeout(performJump, duration / 2);
        }

        animationRef.current = setTimeout(moveCharacter, duration);
    }, [size, isJumping, isDragging, cancelCurrentMovement]);

    const performJump = useCallback(() => {
        if (isJumping || isDragging) return;
        setIsJumping(true);
        setAnimation('Jump');

        const jumpHeight = 50;
        const jumpDuration = 500;
        let startTime;

        const animateJump = (time) => {
            if (!startTime) startTime = time;
            const elapsedTime = time - startTime;
            const progress = Math.min(elapsedTime / jumpDuration, 1);

            const jumpProgress = Math.sin(progress * Math.PI);
            const newY = position.y - jumpHeight * jumpProgress;

            setPosition(prevPos => ({ ...prevPos, y: newY }));

            if (progress < 1) {
                jumpRef.current = requestAnimationFrame(animateJump);
            } else {
                setIsJumping(false);
                setAnimation(speed === 4 ? 'Run' : 'Walk');
            }
        };

        jumpRef.current = requestAnimationFrame(animateJump);
    }, [position.y, speed, isDragging]);

    useEffect(() => {
        moveCharacter();
        return cancelCurrentMovement;
    }, [moveCharacter, cancelCurrentMovement]);

    const startDragging = useCallback(() => {
        setIsDragging(true);
        cancelCurrentMovement();
        setAnimation('Roll');
    }, [cancelCurrentMovement]);

    const stopDragging = useCallback(() => {
        setIsDragging(false);
        setAnimation('Walk');
        moveCharacter();
    }, [moveCharacter]);

    const handleMouseDown = useCallback((e) => {
        const rect = e.target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        setIsDragging(true);
        startDragging();

        const handleMouseMove = (e) => {
            const newX = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - size));
            const newY = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - size));
            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            stopDragging();
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [size, startDragging, stopDragging]);

    const handleAnimationComplete = useCallback(() => {
        if (animation === 'Death') {
            setTimeout(() => setAnimation('Walk'), 2000);
        }
    }, [animation]);

    const loadModel = useCallback((character) => {
        fetch(chrome.runtime.getURL(`assets/models/${character}_Animations.glb`))
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                setModel(arrayBuffer);
            });
    }, []);

    useEffect(() => {
        loadModel(currentCharacter);
    }, [currentCharacter, loadModel]);

    const playAnimation = useCallback((newAnimation, duration = 3000) => {
        setAnimation(newAnimation);
        if (newAnimation !== 'Death') {
            setTimeout(() => setAnimation('Walk'), duration);
        }
    }, []);

    const changeCharacter = useCallback((character) => {
        setCurrentCharacter(character);
        loadModel(character);
    }, [loadModel]);

    const toggleVisibility = useCallback((visibility) => {
        setIsVisible(visibility);
    }, []);

    return {
        isVisible,
        model,
        currentCharacter,
        position,
        direction,
        animation,
        speed,
        isDragging,
        handleMouseDown,
        handleAnimationComplete,
        playAnimation,
        changeCharacter,
        toggleVisibility,
    };
};

export default useCharacter;