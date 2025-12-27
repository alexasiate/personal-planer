export const getCurrentWeekDays = () => {
  const curr = new Date();
  const week = [];
  
  // Starting Monday
  const currentDay = curr.getDay(); // 0-6 (Sun-Sat)
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distanceToMonday);

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    week.push(day);
  }
  return week;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export const getWeekdayName = (date: Date): string => {
  return date.toLocaleDateString('de-DE', { weekday: 'long' });
};

// Returns YYYY-MM-DD for input values
export const toISODate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};