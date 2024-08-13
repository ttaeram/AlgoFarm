import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelViewer from '../../contentScript/ModelViewer';
import { Box, Button } from '@mui/material';

const characters = ['CAT', 'DOG'];

const CharacterChoice = ({ onCharacterSelect }) => {
    const [currentCharacter, setCurrentCharacter] = useState(characters[0]);
    const [model, setModel] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const loadModel = async () => {
            const response = await fetch(chrome.runtime.getURL(`assets/models/${currentCharacter}.glb`));
            const arrayBuffer = await response.arrayBuffer();
            setModel(arrayBuffer);
        };
        loadModel();
    }, [currentCharacter]);

    const handleCharacterChange = () => {
        const nextIndex = (characters.indexOf(currentCharacter) + 1) % characters.length;
        setCurrentCharacter(characters[nextIndex]);
    };

    const handleSelect = () => {
        onCharacterSelect(currentCharacter);
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
            }}
        >
            <Canvas style={{ width: '100%', height: '80%' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1 }}>
                <Button onClick={handleCharacterChange} variant="outlined" size="small">
                    Change Character
                </Button>
                <Button onClick={handleSelect} variant="contained" color="primary" size="small">
                    Select
                </Button>
            </Box>
        </Box>
    );
};

export default CharacterChoice;