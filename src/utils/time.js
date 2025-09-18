export function getGreetingForDate(date) {
  const hours = date.getHours();

  if (hours >= 5 && hours < 12) {
    return "Good morning";
  }

  if (hours >= 12 && hours < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}
