import React from 'react';
import { Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';
import * as styles from './CalendarCell.module.css';

// DOM으로 전달되지 않도록 prop을 필터링합니다.
const BaseCalendarCell = styled(({ isCurrentMonth, isToday, ...otherProps }) => (
  <Paper {...otherProps} />
))(({ theme, isCurrentMonth, isToday }) => ({
  backgroundColor: isCurrentMonth ? '' : '#f0f0f0',
  border: isToday ? '2px solid red' : '1px solid #ccc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '50px',
  borderRadius: '10px',
  transition: 'background-color 0.3s',
}));

const CalendarCell0 = (props) => (
  <BaseCalendarCell {...props} className={`${styles.calendarCell} ${styles.level0}`}>
    <Typography variant="body2">{props.children}</Typography>
  </BaseCalendarCell>
);

const CalendarCell1 = (props) => (
  <BaseCalendarCell {...props} className={`${styles.calendarCell} ${styles.level1}`}>
    <Typography variant="body2">{props.children}</Typography>
  </BaseCalendarCell>
);

const CalendarCell2 = (props) => (
  <BaseCalendarCell {...props} className={`${styles.calendarCell} ${styles.level2}`}>
    <Typography variant="body2">{props.children}</Typography>
  </BaseCalendarCell>
);

const CalendarCell3 = (props) => (
  <BaseCalendarCell {...props} className={`${styles.calendarCell} ${styles.level3}`}>
    <Typography variant="body2">{props.children}</Typography>
  </BaseCalendarCell>
);

const CalendarCell4 = (props) => (
  <BaseCalendarCell {...props} className={`${styles.calendarCell} ${styles.level4}`}>
    <Typography variant="body2">{props.children}</Typography>
  </BaseCalendarCell>
);

export { CalendarCell0, CalendarCell1, CalendarCell2, CalendarCell3, CalendarCell4 };
