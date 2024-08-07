import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';

const SelectGroup = () => {
  const navigate = useNavigate();

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
      <Typography
        variant="h4"
        sx={{ mb: 2, fontWeight: 'bold', color: '#4caf50' }}
      >
        AlgoFarm
      </Typography>

      <Paper
        sx={{
          width: 340,
          height: 210,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <img
          src="images/logo.jpeg"
          alt="algoFarm"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate('/create-group')}
          sx={{width:'340px'}}
        >
          그룹 생성
        </Button>
        <Button
          variant="outlined"
          color="success"
          onClick={() => navigate('/join-group')}
          sx={{width:'340px'}}
        >
          그룹 참가
        </Button>
      </Box>
    </Box>
  );
};

export default SelectGroup;
