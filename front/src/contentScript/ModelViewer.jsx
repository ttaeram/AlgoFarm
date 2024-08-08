import React, { useEffect, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

const ModelViewer = ({
                         modelData,
                         animation,
                         rotation,
                         scale ,
                         cameraDistanceFactor,
                         isPopup
                     }) => {
    const groupRef = useRef();
    const { scene, camera } = useThree();
    const mixerRef = useRef();
    const modelLoadedRef = useRef(false);

    const memoizedModelData = useMemo(() => modelData, [modelData]);

    useEffect(() => {
        if (modelLoadedRef.current) return;

        const loader = new GLTFLoader();
        loader.parse(
            memoizedModelData,
            '',
            (loadedGltf) => {
                //console.log('GLTF loaded successfully:', loadedGltf);

                // 기존 모델 제거
                if (groupRef.current) {
                    scene.remove(groupRef.current);
                }

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

                // 카메라 위치 조정 (팝업에서만)
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
                console.error('An error occurred while loading the model:', error);
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
    }, [memoizedModelData, animation, scale, scene, camera, cameraDistanceFactor, isPopup]);

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

export default React.memo(ModelViewer);