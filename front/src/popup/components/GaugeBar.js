import React from 'react';
import * as styles from './GaugeBar.module.css';

const GaugeBar = ({ contribution }) => {
  const percentage = Math.min(Math.max(contribution, 0), 100);

  return (
    <div className={styles.gauge_bar}>
      <div className={styles.gauge_bar_container}>
        <div
          className={styles.gauge_bar_fill}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className={styles.gauge_bar_value}>{percentage}%</div>
    </div>
  );
};

export default GaugeBar;
