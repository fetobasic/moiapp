export const minsToFormattedTime = (mins: number): [days: number, hours: number, minutes: number] => {
  const minsInDay = 60 * 24;
  mins = Math.abs(mins);

  const days = Math.floor(mins / minsInDay);
  const hours = Math.floor((mins % minsInDay) / 60);
  const minutes = Math.floor((mins % minsInDay) % 60);

  return [days, hours, minutes];
};
