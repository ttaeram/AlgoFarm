import { useState, useEffect, useRef, useCallback } from 'react';

const useCharacterMovement = (size) => {
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

    const duration = Math.random() * 2000 + 1000; // 1-3 seconds
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
            moveCharacter(); // Start a new movement in the opposite direction
            return prevPos; // Don't update the position this time
          }
          return { ...prevPos, x: newX };
        });
      }
    }, 16);

    const jumpChance = Math.random();
    if (jumpChance < 0.2 && newAnimation !== 'Sit') {
      setTimeout(() => {
        performJump();
      }, duration / 2);
    }

    animationRef.current = setTimeout(() => {
      cancelCurrentMovement();
      moveCharacter();
    }, duration);
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

  return {
    position,
    setPosition,
    direction,
    animation,
    setAnimation,
    speed,
    isJumping,
    startDragging,
    stopDragging
  };
};

export default useCharacterMovement;
