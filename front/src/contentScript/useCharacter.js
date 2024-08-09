import { useState, useEffect, useRef, useCallback } from 'react';

const useCharacter = (initialVisibility = true, size = 120) => {
    const [isVisible, setIsVisible] = useState(initialVisibility);
    const [model, setModel] = useState(null);
    const [currentCharacter, setCurrentCharacter] = useState('Cat');
    const [position, setPosition] = useState({ x: window.innerWidth - 220, y: window.innerHeight - 220 });
    const [direction, setDirection] = useState(1);
    const [speed, setSpeed] = useState(2);
    const [isJumping, setIsJumping] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [animationConfig, setAnimationConfig] = useState({ name: 'Walk', pauseAtTime: null });

    const animationRef = useRef();
    const moveIntervalRef = useRef();
    const jumpRef = useRef();
    const currentAnimationRef = useRef(null);

    const cancelCurrentMovement = useCallback(() => {
        clearTimeout(animationRef.current);
        clearInterval(moveIntervalRef.current);
    }, []);

    const moveCharacter = useCallback(() => {
        if (isDragging || currentAnimationRef.current) return;

        cancelCurrentMovement();

        const duration = Math.random() * 2000 + 1000;
        const newDirection = Math.random() < 0.5 ? -1 : 1;
        const newAnimation = Math.random() < 0.6 ? 'Walk' : Math.random() < 0.8 ? 'Run' : 'Sit';
        const newSpeed = newAnimation === 'Run' ? 4 : 2;

        setDirection(newDirection);
        setAnimationConfig({ name: newAnimation, pauseAtTime: null });
        setSpeed(newSpeed);

        moveIntervalRef.current = setInterval(() => {
            if (!isJumping && newAnimation !== 'Sit' && !isDragging && !currentAnimationRef.current) {
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
        if (isJumping || isDragging || currentAnimationRef.current) return;
        setIsJumping(true);
        setAnimationConfig({ name: 'Jump', pauseAtTime: null });

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
                setAnimationConfig({ name: speed === 4 ? 'Run' : 'Walk', pauseAtTime: null });
            }
        };

        jumpRef.current = requestAnimationFrame(animateJump);
    }, [position.y, speed, isDragging]);

    useEffect(() => {
        if (!currentAnimationRef.current) {
            moveCharacter();
        }
        return cancelCurrentMovement;
    }, [moveCharacter, cancelCurrentMovement]);

    const startDragging = useCallback(() => {
        setIsDragging(true);
        cancelCurrentMovement();
        setAnimationConfig({ name: 'Roll', pauseAtTime: null });
    }, [cancelCurrentMovement]);

    const stopDragging = useCallback(() => {
        setIsDragging(false);
        if (!currentAnimationRef.current) {
            setAnimationConfig({ name: 'Walk', pauseAtTime: null });
            moveCharacter();
        }
    }, [moveCharacter]);

    const handleMouseDown = useCallback((e) => {
        if (currentAnimationRef.current) return;

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
        if (currentAnimationRef.current) {
            clearTimeout(currentAnimationRef.current.timeout);
            currentAnimationRef.current = null;
        }
        if (animationConfig.name === 'Death') {
            setTimeout(() => setAnimationConfig({ name: 'Walk', pauseAtTime: null }), 2000);
        } else if (!isDragging) {
            setAnimationConfig({ name: 'Walk', pauseAtTime: null });
            moveCharacter();
        }
    }, [animationConfig.name, isDragging, moveCharacter]);

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

    const playAnimation = useCallback((newAnimation, duration = 3000, pauseTime = null) => {
        if (currentAnimationRef.current) {
            clearTimeout(currentAnimationRef.current.timeout);
        }

        setAnimationConfig({ name: newAnimation, pauseAtTime: pauseTime });

        currentAnimationRef.current = {
            animation: newAnimation,
            timeout: setTimeout(() => {
                currentAnimationRef.current = null;
                if (!isDragging) {
                    setAnimationConfig({ name: 'Walk', pauseAtTime: null });
                    moveCharacter();
                }
            }, duration)
        };
    }, [isDragging, moveCharacter]);

    const handleCustomPlayAnimation = useCallback((event) => {
        const { animation, duration } = event.detail;
        let pauseTime = null;

        if (animation === 'Death') {
            pauseTime = 0.3; // Death 애니메이션을 0.3초에 멈춤
        }

        playAnimation(animation, duration, pauseTime);
    }, [playAnimation]);

    useEffect(() => {
        document.addEventListener('playAnimation', handleCustomPlayAnimation);
        return () => document.removeEventListener('playAnimation', handleCustomPlayAnimation);
    }, [handleCustomPlayAnimation]);

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
        animationConfig,
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