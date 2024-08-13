import React, { useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const ModelViewer = ({
                         modelData,
                         animationConfig,
                         rotation,
                         scale,
                         cameraDistanceFactor,
                         isPopup,
                         onAnimationComplete,
                     }) => {
    const groupRef = useRef();
    const { scene, camera } = useThree();
    const mixerRef = useRef();
    const actionRef = useRef();
    const modelLoadedRef = useRef(false);

    const memoizedModelData = useMemo(() => modelData, [modelData]);

    useEffect(() => {
        if (modelLoadedRef.current) return;

        const loader = new GLTFLoader();
        loader.parse(
            memoizedModelData,
            '',
            (loadedGltf) => {
                if (groupRef.current) {
                    scene.remove(groupRef.current);
                }

                scene.add(loadedGltf.scene);

                const mixer = new THREE.AnimationMixer(loadedGltf.scene);
                mixerRef.current = mixer;

                const animationIndex = loadedGltf.animations.findIndex(anim => anim.name === animationConfig.name);
                if (animationIndex !== -1) {
                    const clip = loadedGltf.animations[animationIndex];
                    const action = mixer.clipAction(clip);
                    actionRef.current = action;
                    action.play();
                }

                loadedGltf.scene.scale.set(scale, scale, scale);

                const box = new THREE.Box3().setFromObject(loadedGltf.scene);
                const center = box.getCenter(new THREE.Vector3());
                loadedGltf.scene.position.sub(center);

                groupRef.current = loadedGltf.scene;

                if (isPopup) {
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const fov = camera.fov * (Math.PI / 180);
                    const cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * cameraDistanceFactor;
                    camera.position.set(0, maxDim / 3, cameraZ);
                    camera.lookAt(new THREE.Vector3(0, 0, 0));
                }

                modelLoadedRef.current = true;
            },
            (error) => {
                // console.error('An error occurred while loading the model:', error);
            }
        );

        return () => {
            if (mixerRef.current) {
                mixerRef.current.stopAllAction();
            }
            if (groupRef.current) {
                scene.remove(groupRef.current);
            }
            modelLoadedRef.current = false;
        };
    }, [memoizedModelData, animationConfig.name, scale, scene, camera, cameraDistanceFactor, isPopup]);

    useEffect(() => {
        if (actionRef.current) {
            actionRef.current.stop();
            const animationIndex = actionRef.current.getClip().tracks.findIndex(track => track.name === animationConfig.name);
            if (animationIndex !== -1) {
                const newAction = mixerRef.current.clipAction(actionRef.current.getClip());
                newAction.play();
                actionRef.current = newAction;
            }
        }
    }, [animationConfig.name]);

    useFrame((state, delta) => {
        if (mixerRef.current) {
            if (animationConfig.pauseAtTime !== null && actionRef.current) {
                if (actionRef.current.time >= animationConfig.pauseAtTime) {
                    actionRef.current.paused = true;
                } else {
                    mixerRef.current.update(delta);
                }
            } else {
                mixerRef.current.update(delta);
            }
        }
        if (groupRef.current && !isPopup) {
            groupRef.current.rotation.y = rotation;
        }
    });

    return null;
};

export default React.memo(ModelViewer);