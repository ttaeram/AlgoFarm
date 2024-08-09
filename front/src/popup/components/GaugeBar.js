import React from 'react';
import * as styles from './GaugeBar.module.css';

const GaugeBar = ({ contribution, maxExperience }) => {
  const percentage = maxExperience > 0 
    ? Math.min(Math.max((contribution / maxExperience) * 100, 0), 100) 
    : 0;
  return (
    <div className={styles.gauge_bar}>
      <div className={styles.gauge_bar_container}>
        <div
          className={styles.gauge_bar_fill}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className={styles.gauge_bar_value}>{percentage.toFixed(2)}%</div>
    </div>
  );
};

export default GaugeBar;
