import React, { useState } from 'react';
import { format, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { Box, Button, Typography, Grid } from '@mui/material';
import * as styles from './CalendarCell.module.css';
import { generateCalendar, getFormattedDate } from './CalendarUtils';
import { CalendarCell0, CalendarCell1, CalendarCell2, CalendarCell3, CalendarCell4 } from './CalendarCell';

const GrassGraph = ({ data }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarDays = generateCalendar(currentDate);

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const renderDay = (day) => {
    const dateString = getFormattedDate(day);
    const dayData = data.find(d => d.submitTime.startsWith(dateString));
    const commitCount = dayData ? dayData.commitCount : 0;
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isToday = isSameDay(day, new Date());

    let CalendarCell;
    if (commitCount > 5) {
      CalendarCell = CalendarCell4;
    } else if (commitCount > 3) {
      CalendarCell = CalendarCell3;
    } else if (commitCount > 1) {
      CalendarCell = CalendarCell2;
    } else if (commitCount > 0) {
      CalendarCell = CalendarCell1;
    } else {
      CalendarCell = CalendarCell0;
    }

    return (
      <CalendarCell
        key={dateString}
        isCurrentMonth={isCurrentMonth}
        isToday={isToday}
        title={`Date: ${dateString}, Commits: ${commitCount}`}
      >
        {day.getDate()}
      </CalendarCell>
    );
  };

  return (
    <Box className={styles.grassGraph}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button variant="contained" color="primary" onClick={handlePrevMonth}>
          Previous Month
        </Button>
        <Typography variant="h6">{format(currentDate, 'yyyy년 MM월')}</Typography>
        <Button variant="contained" color="primary" onClick={handleNextMonth}>
          Next Month
        </Button>
      </Box>
      <Box className={styles.calendarGrid}>
        {calendarDays.map(day => renderDay(day))}
      </Box>
    </Box>
  );
};

export default GrassGraph;
