import * as styles from './GrassGraph.module.css';

const GrassGraph = ({ data }) => {
  const getColor = (count) => {
    if (count > 5) return styles.level4;
    if (count > 3) return styles.level3;
    if (count > 1) return styles.level2;
    if (count > 0) return styles.level1;
    return styles.level0;
  };

  // 날짜 배열 생성
  const dates = data.reduce((acc, curr) => {
    const date = curr.submitTime.split('T')[0];
    if (!acc.includes(date)) {
      acc.push(date);
    }
    return acc;
  }, []);

  return (
    <div className={styles.grassGraph}>
      {dates.map(date => {
        const dayData = data.find(d => d.submitTime.startsWith(date));
        const commitCount = dayData ? dayData.commitCount : 0;
        return <div key={date} className={`${styles.grassCell} ${getColor(commitCount)}`} title={`Date: ${date}, Commits: ${commitCount}`}></div>;
      })}
    </div>
  );
};

export default GrassGraph;
