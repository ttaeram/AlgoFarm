import {useState, useEffect, useCallback} from 'react';
import useCharacterMovement from './useCharacterMovement';
import useCharacterDrag from './useCharacterDrag';

const useCharacter = (initialVisibility = true, size = 120) => {
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
        startDragging: startMovementDragging,
        stopDragging: stopMovementDragging
    } = useCharacterMovement(size);

    const {
        isDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    } = useCharacterDrag(size, setPosition, startMovementDragging, stopMovementDragging);

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
    }, [currentCharacter, loadModel]);

    const playAnimation = useCallback((newAnimation) => {
        setAnimation(newAnimation);
        if (newAnimation !== 'Death') {
            setTimeout(() => setAnimation('Walk'), 3000);
        }
    }, [setAnimation]);


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
        handleMouseMove,
        handleMouseUp,
        handleAnimationComplete,
        playAnimation,
        changeCharacter,
        toggleVisibility,
    };
};

export default useCharacter;