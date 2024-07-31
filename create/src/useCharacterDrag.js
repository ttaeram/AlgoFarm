import { useState, useCallback } from 'react';

const useCharacterDrag = (size, setPosition, startDragging, stopDragging) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setIsDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
    startDragging();
  }, [startDragging]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - size));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - size));
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, dragOffset, setPosition, size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    stopDragging();
  }, [stopDragging]);

  return { isDragging, handleMouseDown, handleMouseMove, handleMouseUp };
};

export default useCharacterDrag;
