import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from '../../contentScript/ModelViewer';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const characters = ['CAT', 'DOG'];

const CharacterChoice = ({ onCharacterSelect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [model, setModel] = useState(null);
    const containerRef = useRef(null);

    const currentCharacter = characters[currentIndex];

    useEffect(() => {
        const loadModel = async () => {
            const response = await fetch(chrome.runtime.getURL(`assets/models/${currentCharacter}.glb`));
            const arrayBuffer = await response.arrayBuffer();
            setModel(arrayBuffer);
        };
        loadModel();
    }, [currentCharacter]);

    useEffect(() => {
        // 캐릭터가 변경될 때마다 onCharacterSelect 호출
        onCharacterSelect(currentCharacter);
    }, [currentCharacter, onCharacterSelect]);

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + characters.length) % characters.length);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length);
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                width: 340,
                height: 210,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                overflow: 'hidden',
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: 1,
                position: 'relative',
            }}
        >
            <Canvas style={{ width: '100%', height: '100%' }}>
                <OrbitControls enablePan={false} enableZoom={false} />
                <ambientLight intensity={2} />
                <directionalLight color={0xffffff} intensity={3} position={[5, 5, 5]} />
                {model && (
                    <ModelViewer
                        modelData={model}
                        animationConfig={{ name: 'Idle_A', pauseAtTime: null }}
                        cameraDistanceFactor={0.5}
                        cameraHorizontalAngle={0}
                        scale={3}
                        rotation={0}
                        isPopup={true}
                    />
                )}
            </Canvas>

            <IconButton
                onClick={handlePrevious}
                sx={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                }}
            >
                <ChevronLeft />
            </IconButton>

            <IconButton
                onClick={handleNext}
                sx={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                }}
            >
                <ChevronRight />
            </IconButton>

            <Typography
                variant="subtitle1"
                sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    padding: '2px 10px',
                    borderRadius: '10px'
                }}
            >
                {currentCharacter}
            </Typography>
        </Box>
    );
};

export default CharacterChoice;