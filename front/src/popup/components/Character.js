import { useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from '../../contentScript/ModelViewer';
import useCharacterMovement from '../../contentScript/useCharacterMovement';
import useCharacterDrag from '../../contentScript/useCharacterDrag';

const Character = () => {

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

    </div>
  );
};

export default Character;
