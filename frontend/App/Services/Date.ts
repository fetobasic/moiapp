import { format, isToday, isYesterday } from 'date-fns';

export const getDataTitle = (date: number) => {
  const unixDate = date * 1000;

  if (!date) {
    return 'Never';
  }

  if (isToday(unixDate)) {
    return 'Today';
  }
  if (isYesterday(unixDate)) {
    return 'Yesterday';
  }

  return format(unixDate, 'dd/MM/yy');
};
