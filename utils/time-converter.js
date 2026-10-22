export function timeConverter(isoTime) {
  const currentTime = new Date().getTime();
  const pastTime = new Date(isoTime).getTime();
  const timeDifference = currentTime - pastTime;

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  const ago = (value, unit) => `${value} ${unit}${value === 1 ? '' : 's'} ago`;

  if (seconds < 60) {
    return ago(seconds, 'second');
  } else if (minutes < 60) {
    return ago(minutes, 'minute');
  } else if (hours < 24) {
    return ago(hours, 'hour');
  } else if (days < 30) {
    return ago(days, 'day');
  } else if (months < 12) {
    return ago(months, 'month');
  } else {
    return ago(years, 'year');
  }
}
