import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const ModelViewer = ({
                       modelData,
                       animation = 'Idle_A',
                       rotation = 0,
                       scale = 1,
                       cameraDistanceFactor = 1.5,
                       isPopup = false
                     }) => {
  const groupRef = useRef();
  const { scene, camera } = useThree();
  const mixerRef = useRef();

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.parse(
        modelData,
        '',
        (loadedGltf) => {
          console.log('GLTF loaded successfully:', loadedGltf);
          scene.add(loadedGltf.scene);

          const mixer = new THREE.AnimationMixer(loadedGltf.scene);
          mixerRef.current = mixer;

          const animationIndex = loadedGltf.animations.findIndex(anim => anim.name === animation);
          if (animationIndex !== -1) {
            const action = mixer.clipAction(loadedGltf.animations[animationIndex]);
            action.play();
          }

          // 모델 크기 조정
          loadedGltf.scene.scale.set(scale, scale, scale);

          // 모델 중앙 정렬
          const box = new THREE.Box3().setFromObject(loadedGltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          loadedGltf.scene.position.sub(center);

          groupRef.current = loadedGltf.scene;

          // 팝업에서 사용될 때 카메라 위치 조정
          if (isPopup) {
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * cameraDistanceFactor;
            camera.position.set(0, 0, cameraZ);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
          }
        },
        (error) => {
          console.error('An error occurred while loading the model:', error);
        }
    );
  }, [modelData, animation, scale, scene, camera, cameraDistanceFactor, isPopup]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    if (groupRef.current && !isPopup) {
      groupRef.current.rotation.y = rotation;
    }
  });

  return null;
};

export default ModelViewer;