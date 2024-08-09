import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/context';
import BackButton from '../components/BackButton';
import { Box, Typography, Button, TextField, Alert } from '@mui/material';
import CharacterChoice from '../components/CharacterChoice';

function CreateGroup() {
    const [groupName, setGroupName] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const { jwt, setGroupId, fetchGroupInfo } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setGroupName(e.target.value);
    };

    const handleCharacterSelect = (character) => {
        setSelectedCharacter(character);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim() || !selectedCharacter) {
            setShowWarning(true);
            setTimeout(() => {
                setShowWarning(false);
            }, 3000);
        } else {
            try {
                const mascotType = selectedCharacter.toUpperCase();
                const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        groupName,
                        mascotType
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to create group');
                }

                const data = await response.json();
                const newGroupId = data.data.groupId;
                setGroupId(newGroupId);

                await fetchGroupInfo(jwt, newGroupId);

                navigate('/my-page/group-info');
            } catch (error) {
                console.error('Error creating group:', error);
                setShowWarning(true);
                setTimeout(() => {
                    setShowWarning(false);
                }, 3000);
            }
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 500,
                height: 500,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                boxShadow: 3,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '100%',
                    mb: 3,
                }}
            >
                <BackButton/>
                <Typography
                    variant="h4"
                    sx={{ ml: 15, fontWeight: 'bold', color: '#4caf50', textAlign: 'center'}}
                >
                    알고팜
                </Typography>
            </Box>

            <CharacterChoice onCharacterSelect={handleCharacterSelect} />

            <form onSubmit={handleSubmit} style={{ width: '340px' }}>
                <Box
                    display="flex"
                    alignItems="center"
                    mb={2}
                    sx={{ width: '340px' }}
                >
                    <Typography variant="h6" sx={{ mr: 2 , whiteSpace: 'nowrap'}}>
                        그룹 이름
                    </Typography>
                    <Box display="flex" alignItems="center" flexGrow={1}>
                        <TextField
                            type="text"
                            value={groupName}
                            onChange={handleInputChange}
                            placeholder="생성할 그룹 이름을 입력하세요"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    color="success"
                    type="submit"
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    그룹 생성
                </Button>
                {showWarning && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        그룹 이름과 캐릭터를 선택하세요.
                    </Alert>
                )}
            </form>
        </Box>
    );
}

export default CreateGroup;