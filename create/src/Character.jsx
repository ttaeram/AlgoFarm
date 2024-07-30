import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const Character = ({ currentPosition, prevPosition,rotationOffset }) => {
  const [model, setModel] = useState(null);
  const mixerRef = useRef();
  const clockRef = useRef(new THREE.Clock());
  const targetRotationRef = useRef(0);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(chrome.runtime.getURL('assets/models/toon_cat_free.glb'), (gltf) => {
      setModel(gltf.scene);
      const mixer = new THREE.AnimationMixer(gltf.scene);
      mixerRef.current = mixer;

      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    });
  }, []);

  useFrame(() => {
    if (model && mixerRef.current) {
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);

      // 이동 방향 계산
      const dx = currentPosition.x - prevPosition.x;
      const dy = currentPosition.y - prevPosition.y;

      if (dx !== 0 || dy !== 0) {
        const angle = Math.atan2(dy, dx);
        targetRotationRef.current = angle + rotationOffset; // rotationOffset 적용
      }

      // 부드러운 회전 적용
      const rotationSpeed = 10 * delta;
      model.rotation.y += (targetRotationRef.current - model.rotation.y) * rotationSpeed;
    }
  });

  if (!model) return null;

  return <primitive object={model} scale={[0.3, 0.3, 0.3]} position={[0, 0, 0]} />;
};

export default Character;
