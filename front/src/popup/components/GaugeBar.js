// import React from 'react';
// import * as styles from './GaugeBar.module.css';

// const GaugeBar = ({ contribution, maxExperience }) => {
//   const percentage = maxExperience > 0 
//     ? Math.min(Math.max((contribution / maxExperience) * 100, 0), 100) 
//     : 0;
//   return (
//     <div className={styles.gauge_bar}>
//       <div className={styles.gauge_bar_container}>
//         <div
//           className={styles.gauge_bar_fill}
//           style={{ width: `${percentage}%` }}
//         ></div>
//       </div>
//       <div className={styles.gauge_bar_value}>{percentage.toFixed(2)}%</div>
//     </div>
//   );
// };

// export default GaugeBar;



import React from 'react';
import * as styles from './GaugeBar.module.css';

const GaugeBar = ({ skillName, contribution, maxExperience }) => {
  const percentage = Math.min(Math.max((contribution / maxExperience) * 100, 0), 100);

  return (
    <div className={styles.gauge_bar}>
      <div className={styles.gauge_item}>
        <p>
          <span>{skillName}</span>
          <span>{percentage.toFixed(2)}%</span>
        </p>
        <div className={styles.gauge_progress}>
          <div
            className={styles.gauge_progress_level}
            // style={{ width: `${percentage}%` }}
            style={{
              animationName: 'fillGauge',  // 애니메이션 이름
              animationDuration: '5s',      // 애니메이션 지속 시간
              animationTimingFunction: 'ease-in-out',
              animationFillMode: 'forwards',
              width: `${percentage}%`      // 최종 width를 동적으로 설정
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default GaugeBar;