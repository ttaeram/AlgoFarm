import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const ModelViewer = ({
                       modelData,
                       animation = 'Walk',
                       rotation = 0,
                       pauseAnimation = false,
                       onAnimationComplete,
                       cameraDistanceFactor = 2,
                       cameraHorizontalAngle = 0
                     }) => {
  const groupRef = useRef();
  const { scene, camera } = useThree();
  const [gltf, setGltf] = useState(null);
  const mixerRef = useRef();
  const currentAnimationRef = useRef(null);
  const [isDeathAnimationComplete, setIsDeathAnimationComplete] = useState(false);

  const animationMap = {
    Attack: 0, Bounce: 1, Clicked: 2, Death: 3, Eat: 4, Fear: 5, Fly: 6, Hit: 7,
    Idle_A: 8, Idle_B: 9, Idle_C: 10, Jump: 11, Roll: 12, Run: 13, Sit: 14,
    Spin: 15, Swim: 16, Walk: 17
  };

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.parse(
      modelData,
      '',
      (loadedGltf) => {
        console.log('GLTF loaded successfully:', loadedGltf);
        setGltf(loadedGltf);

        const mixer = new THREE.AnimationMixer(loadedGltf.scene);
        mixerRef.current = mixer;

        const defaultAnimationIndex = animationMap['Walk'];
        if (loadedGltf.animations[defaultAnimationIndex]) {
          const action = mixer.clipAction(loadedGltf.animations[defaultAnimationIndex]);
          action.play();
          currentAnimationRef.current = action;
        }

        // Reset model position and scale
        loadedGltf.scene.position.set(0, 0, 0);
        loadedGltf.scene.scale.set(1, 1, 1);

        // Adjust camera and model
        adjustModelAndCamera(loadedGltf.scene);
      },
      (error) => {
        console.error('An error occurred while loading the model:', error);
      }
    );
  }, [modelData]);

  const adjustModelAndCamera = (model) => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Scale the model to fit within a 1x1x1 cube
    const scale = 1 / Math.max(size.x, size.y, size.z);
    model.scale.multiplyScalar(scale);

    // Recalculate the bounding box after scaling
    box.setFromObject(model);
    box.getCenter(center);
    box.getSize(size);

    // Center the model
    model.position.sub(center.multiplyScalar(scale));

    // Position the camera
    const distance = Math.max(size.x, size.y, size.z) * cameraDistanceFactor;
    const fov = camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(distance / Math.tan(fov / 2));

    // Calculate camera position with horizontal angle
    const angleRad = cameraHorizontalAngle * (Math.PI / 180);
    const cameraX = Math.sin(angleRad) * cameraZ;
    const cameraZAdjusted = Math.cos(angleRad) * cameraZ;

    camera.position.set(cameraX, 0, cameraZAdjusted);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Adjust near and far planes
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    console.log('Model positioned:', model.position);
    console.log('Camera positioned:', camera.position);
    console.log('Model size:', size);
    console.log('Camera distance:', distance);
    console.log('Camera angle:', cameraHorizontalAngle);
  };

  useEffect(() => {
    if (gltf && mixerRef.current) {
      const animationIndex = animationMap[animation];
      if (typeof animationIndex !== 'undefined' && gltf.animations[animationIndex]) {
        if (currentAnimationRef.current) {
          currentAnimationRef.current.fadeOut(0.5);
        }
        const newAction = mixerRef.current.clipAction(gltf.animations[animationIndex]);

        if (animation === 'Death') {
          newAction.setLoop(THREE.LoopOnce);
          newAction.clampWhenFinished = true;
          setIsDeathAnimationComplete(false);

          newAction.reset().fadeIn(0.5).play();

          newAction.onFinished = () => {
            setIsDeathAnimationComplete(true);
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          };
        } else {
          newAction.reset().fadeIn(0.5).play();
        }

        currentAnimationRef.current = newAction;

        if (pauseAnimation && animation === 'Jump') {
          newAction.paused = true;
          newAction.time = newAction.getClip().duration * 0.25;
        } else {
          newAction.paused = false;
        }
      } else {
        console.warn(`Animation "${animation}" not found.`);
      }
    }
  }, [gltf, animation, pauseAnimation, onAnimationComplete]);

  useFrame((state, delta) => {
    if (mixerRef.current && !isDeathAnimationComplete) {
      mixerRef.current.update(delta);
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation;
    }
  });

  if (!gltf) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
};

export default ModelViewer;
