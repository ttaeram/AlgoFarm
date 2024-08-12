

import React from 'react';
import { ProgressBar as FancyProgressBar } from 'react-progressbar-fancy'; // 이름 변경
import * as styles from './GaugeBar.module.css';
import { Typography } from '@mui/material';
import { height } from '@mui/system';

const GaugeBar = ({ nickname, contribution, maxExperience }) => {
  const percentage = Math.min(Math.max((contribution / maxExperience) * 100, 0), 100);

  return (
    <div className={styles.gauge_bar}>
      <div className={styles.gauge_item}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" style={{ fontSize: '16px', color: 'black' }}>
            {nickname}
          </Typography>
          <Typography variant="h6" style={{ fontSize: '16px', color: 'black' }}>
            {percentage.toFixed(2)}%
          </Typography>
        </div>
        <div style={{ height: '15px', width: '100%', backgroundColor: 'transparent' }}></div>
        <div className={styles.gauge_progress}>
          <FancyProgressBar
            score={percentage.toFixed(2)}
            hideText={true}
            progressColor="blue"
            progressWidth={300} // 너비를 설정할 수 있습니다.
            disableGlow={false} // 글로우 효과 비활성화
          />
        </div>
      </div>
    </div>
  );
};

export default GaugeBar;
