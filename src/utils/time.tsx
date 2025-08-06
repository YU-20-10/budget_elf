export function getLocalTime(date: Date) {
  const year = date.getFullYear();
  // padStart(2, '0') 字串長度<2時，在前方補上0
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalTimeISO(date: Date) {
  const utcTime = date.getTime();
  const localTime = new Date(utcTime + 8 * 60 * 60 * 1000);
  return localTime.toISOString().split("T")[0];
}

export function getTimeWithoutMS(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
