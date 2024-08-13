import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const useCharacter = (size = 120) => {
    const [characterState, setCharacterState] = useState({
        isVisible: false,
        model: null,
        currentCharacter: null,
        position: { x: window.innerWidth - 220, y: window.innerHeight - 220 },
        direction: 1,
        speed: 2,
        isJumping: false,
        isDragging: false,
        animationConfig: { name: 'Walk', pauseAtTime: null }
    });

    const animationRef = useRef();
    const moveIntervalRef = useRef();
    const jumpRef = useRef();
    const currentAnimationRef = useRef(null);
    const isInitializedRef = useRef(false);

    const loadCharacterData = useCallback(() => {
        chrome.storage.local.get(['character'], (result) => {
            if (result.character) {
                const characterData = JSON.parse(result.character);
                if (characterData.type) {
                    setCharacterState(prev => ({
                        ...prev,
                        currentCharacter: characterData.type,
                        isVisible: true
                    }));
                } else {
                    setCharacterState(prev => ({ ...prev, isVisible: false }));
                }
            } else {
                setCharacterState(prev => ({ ...prev, isVisible: false }));
            }
        });
    }, []);

    useEffect(() => {
        if (!isInitializedRef.current) {
            loadCharacterData();
            isInitializedRef.current = true;
        }

        const handleStorageChange = (changes, area) => {
            if (area === 'local' && changes.character) {
                loadCharacterData();
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, [loadCharacterData]);

    const loadModel = useCallback(() => {
        if (!characterState.currentCharacter) return;

        fetch(chrome.runtime.getURL(`assets/models/${characterState.currentCharacter}.glb`))
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                setCharacterState(prev => ({ ...prev, model: arrayBuffer }));
            })
            .catch(error => {
                // console.error('Error loading model:', error);
                setCharacterState(prev => ({ ...prev, isVisible: false }));
            });
    }, [characterState.currentCharacter]);

    useEffect(() => {
        if (characterState.currentCharacter) {
            loadModel();
        }
    }, [loadModel, characterState.currentCharacter]);

    const cancelCurrentMovement = useCallback(() => {
        clearTimeout(animationRef.current);
        clearInterval(moveIntervalRef.current);
    }, []);

    const moveCharacter = useCallback(() => {
        if (characterState.isDragging || currentAnimationRef.current) return;

        cancelCurrentMovement();

        const duration = Math.random() * 2000 + 1000;
        const newDirection = Math.random() < 0.5 ? -1 : 1;
        const newAnimation = Math.random() < 0.6 ? 'Walk' : Math.random() < 0.8 ? 'Run' : 'Sit';
        const newSpeed = newAnimation === 'Run' ? 4 : 2;

        setCharacterState(prev => ({
            ...prev,
            direction: newDirection,
            animationConfig: { name: newAnimation, pauseAtTime: null },
            speed: newSpeed
        }));

        moveIntervalRef.current = setInterval(() => {
            if (!characterState.isJumping && newAnimation !== 'Sit' && !characterState.isDragging && !currentAnimationRef.current) {
                setCharacterState(prev => {
                    let newX = prev.position.x + newDirection * newSpeed;
                    if (newX <= 0 || newX >= window.innerWidth - size) {
                        cancelCurrentMovement();
                        moveCharacter();
                        return prev;
                    }
                    return { ...prev, position: { ...prev.position, x: newX } };
                });
            }
        }, 16);

        if (Math.random() < 0.2 && newAnimation !== 'Sit') {
            setTimeout(performJump, duration / 2);
        }

        animationRef.current = setTimeout(moveCharacter, duration);
    }, [characterState.isDragging, characterState.isJumping, cancelCurrentMovement, size]);

    const performJump = useCallback(() => {
        if (characterState.isJumping || characterState.isDragging || currentAnimationRef.current) return;

        setCharacterState(prev => ({
            ...prev,
            isJumping: true,
            animationConfig: { name: 'Jump', pauseAtTime: null }
        }));

        const jumpHeight = 50;
        const jumpDuration = 500;
        let startTime;

        const animateJump = (time) => {
            if (!startTime) startTime = time;
            const elapsedTime = time - startTime;
            const progress = Math.min(elapsedTime / jumpDuration, 1);

            const jumpProgress = Math.sin(progress * Math.PI);
            const newY = characterState.position.y - jumpHeight * jumpProgress;

            setCharacterState(prev => ({
                ...prev,
                position: { ...prev.position, y: newY }
            }));

            if (progress < 1) {
                jumpRef.current = requestAnimationFrame(animateJump);
            } else {
                setCharacterState(prev => ({
                    ...prev,
                    isJumping: false,
                    animationConfig: { name: prev.speed === 4 ? 'Run' : 'Walk', pauseAtTime: null }
                }));
            }
        };

        jumpRef.current = requestAnimationFrame(animateJump);
    }, [characterState.isJumping, characterState.isDragging, characterState.position.y]);

    useEffect(() => {
        if (!currentAnimationRef.current && characterState.isVisible) {
            moveCharacter();
        }
        return cancelCurrentMovement;
    }, [moveCharacter, cancelCurrentMovement, characterState.isVisible]);

    const handleMouseDown = useCallback((e) => {
        if (currentAnimationRef.current) return;

        const rect = e.target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        setCharacterState(prev => ({
            ...prev,
            isDragging: true,
            animationConfig: { name: 'Roll', pauseAtTime: null }
        }));

        const handleMouseMove = (e) => {
            const newX = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - size));
            const newY = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - size));
            setCharacterState(prev => ({
                ...prev,
                position: { x: newX, y: newY }
            }));
        };

        const handleMouseUp = () => {
            setCharacterState(prev => ({
                ...prev,
                isDragging: false,
                animationConfig: { name: 'Walk', pauseAtTime: null }
            }));
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            moveCharacter();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [size, moveCharacter]);

    const handleAnimationComplete = useCallback(() => {
        if (currentAnimationRef.current) {
            clearTimeout(currentAnimationRef.current.timeout);
            currentAnimationRef.current = null;
        }
        if (characterState.animationConfig.name === 'Death') {
            setTimeout(() => setCharacterState(prev => ({
                ...prev,
                animationConfig: { name: 'Walk', pauseAtTime: null }
            })), 2000);
        } else if (!characterState.isDragging) {
            setCharacterState(prev => ({
                ...prev,
                animationConfig: { name: 'Walk', pauseAtTime: null }
            }));
            moveCharacter();
        }
    }, [characterState.animationConfig.name, characterState.isDragging, moveCharacter]);

    const playAnimation = useCallback((newAnimation, duration = 3000, pauseTime = null) => {
        if (currentAnimationRef.current) {
            clearTimeout(currentAnimationRef.current.timeout);
        }

        setCharacterState(prev => ({
            ...prev,
            animationConfig: { name: newAnimation, pauseAtTime: pauseTime }
        }));

        currentAnimationRef.current = {
            animation: newAnimation,
            timeout: setTimeout(() => {
                currentAnimationRef.current = null;
                if (!characterState.isDragging) {
                    setCharacterState(prev => ({
                        ...prev,
                        animationConfig: { name: 'Walk', pauseAtTime: null }
                    }));
                    moveCharacter();
                }
            }, duration)
        };
    }, [characterState.isDragging, moveCharacter]);

    const changeCharacter = useCallback((newCharacter) => {
        chrome.storage.local.set({ character: JSON.stringify({ type: newCharacter }) });
    }, []);

    const toggleVisibility = useCallback((visibility) => {
        if (!visibility) {
            chrome.storage.local.remove('character');
        } else {
            loadCharacterData();
        }
    }, [loadCharacterData]);

    const memoizedState = useMemo(() => ({
        isVisible: characterState.isVisible,
        model: characterState.model,
        currentCharacter: characterState.currentCharacter,
        position: characterState.position,
        direction: characterState.direction,
        animationConfig: characterState.animationConfig,
        speed: characterState.speed,
        isDragging: characterState.isDragging,
    }), [characterState]);

    return {
        ...memoizedState,
        handleMouseDown,
        handleAnimationComplete,
        playAnimation,
        changeCharacter,
        toggleVisibility,
    };
};

export default useCharacter;