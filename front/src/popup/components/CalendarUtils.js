import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

export const generateCalendar = (currentDate) => {
  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });

  return eachDayOfInterval({ start, end });
};

export const getFormattedDate = (date) => format(date, 'yyyy-MM-dd');
