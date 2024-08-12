import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { useAuth } from '../context/context';

const LevelCircle = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: '#F9817D',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 10,
  position: 'relative',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
}));

const CircularExpBar = styled(CircularProgress)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1,
  width: '100% !important',
  height: '100% !important',
  color: '#FFEFAF',
}));

const CharacterLevel = () => {
  const { jwt, groupId, fetchCharacter, character, setCharacter } = useAuth();

  useEffect(() => {
    const getCharacterData = async () => {
      if (jwt && groupId && groupId !== -1) {
        await fetchCharacter(jwt, groupId);
      }
    };
    getCharacterData();
  }, [jwt, groupId]);

  if (!character || !character.maxExp) {
    return <Typography variant="h6" color="textSecondary">Loading...</Typography>;
  }

  const expPercentage = (character.currentExp / character.maxExp) * 100;

  return (
    <Tooltip title={`Exp: ${character.currentExp} / ${character.maxExp}`}>
      <Box display="flex" alignItems="center">
        <LevelCircle>
          <CircularExpBar
            variant="determinate"
            value={expPercentage}
            thickness={4}
          />
          <Typography variant="h6" color="white" style={{ zIndex: 2 }}>
            {`Lv. ${character.level}`}
          </Typography>
        </LevelCircle>
      </Box>
    </Tooltip>
  );
};

export default CharacterLevel;
