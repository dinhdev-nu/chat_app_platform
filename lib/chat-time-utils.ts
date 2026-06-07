const CHAT_LOCALE = "vi-VN";
const CHAT_TIME_ZONE = "Asia/Ho_Chi_Minh";

const timeFormatter = new Intl.DateTimeFormat(CHAT_LOCALE, {
  timeZone: CHAT_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  hourCycle: "h23",
});

const dateFormatter = new Intl.DateTimeFormat(CHAT_LOCALE, {
  timeZone: CHAT_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const datePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CHAT_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function normalizeTimestamp(value: string) {
  const trimmedValue = value.trim();
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(trimmedValue)) return trimmedValue;

  if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/.test(trimmedValue)) {
    return `${trimmedValue.replace(" ", "T")}Z`;
  }

  return trimmedValue;
}

function toDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(normalizeTimestamp(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function getVietnamDateParts(date: Date) {
  const parts = datePartsFormatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) return null;

  return { year, month, day };
}

function getVietnamDayDiff(value: string, now = new Date()) {
  const date = toDate(value);
  if (!date) return null;

  const dateParts = getVietnamDateParts(date);
  const nowParts = getVietnamDateParts(now);
  if (!dateParts || !nowParts) return null;

  const dateDay = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day);
  const nowDay = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);

  return Math.round((nowDay - dateDay) / 86400000);
}

export function formatVietnamTime(value: string) {
  const date = toDate(value);
  if (!date) return value;

  return timeFormatter.format(date).replace(/^24:/, "00:");
}

export function formatVietnamDate(value: string) {
  const date = toDate(value);
  if (!date) return value;

  return dateFormatter.format(date);
}

export function formatVietnamRelativeDate(value: string) {
  const dayDiff = getVietnamDayDiff(value);

  if (dayDiff === 0) return "Hôm nay";
  if (dayDiff === 1) return "Hôm qua";

  return formatVietnamDate(value);
}

export function isSameVietnamDate(left?: string | null, right?: string | null) {
  const leftDate = toDate(left);
  const rightDate = toDate(right);
  if (!leftDate || !rightDate) return false;

  const leftParts = getVietnamDateParts(leftDate);
  const rightParts = getVietnamDateParts(rightDate);
  if (!leftParts || !rightParts) return false;

  return (
    leftParts.year === rightParts.year &&
    leftParts.month === rightParts.month &&
    leftParts.day === rightParts.day
  );
}

export function getVietnamDayDiffFromNow(value: string) {
  return getVietnamDayDiff(value);
}
