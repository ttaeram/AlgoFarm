import React, { useState, useEffect } from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import { styled } from '@mui/system';

const GreenSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: '#76ff03',
        '&:hover': {
            backgroundColor: 'rgba(118, 255, 3, 0.08)',
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: '#76ff03',
    },
}));

const ToggleCharacterButton = () => {
    const [showCharacter, setShowCharacter] = useState(true);

    useEffect(() => {
        const fetchCharacterVisibility = () => {
            if (typeof chrome !== "undefined" && chrome.storage) {
                chrome.storage.local.get('showCharacter', (result) => {
                    setShowCharacter(result.showCharacter !== false);
                });
            } else {
                const storedValue = localStorage.getItem('showCharacter');
                setShowCharacter(storedValue !== 'false');
            }
        };

        fetchCharacterVisibility();
    }, []);

    const handleToggle = () => {
        const newShowCharacter = !showCharacter;
        setShowCharacter(newShowCharacter);

        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.set({ showCharacter: newShowCharacter });
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "toggleCharacterVisibility", isVisible: newShowCharacter});
            });
            console.log('character visibility' + newShowCharacter);
        } else {
            localStorage.setItem('showCharacter', newShowCharacter.toString());
        }
    };

    return (
        <FormControlLabel
            control={<GreenSwitch checked={showCharacter} onChange={handleToggle} />}
            label={showCharacter ? '캐릭터 표시' : '캐릭터 숨김'}
        />
    );
}

export default ToggleCharacterButton;