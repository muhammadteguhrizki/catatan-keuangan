export const APP_TIMEZONE = "Asia/Jakarta";

export function getCurrentDateWIB(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function formatDateTimeWIB(date: Date | string): string {
  let parsedDate: Date;

  if (typeof date === "string" && !date.endsWith("Z")) {
    // Timestamp SQLite disimpan dalam UTC
    parsedDate = new Date(date.replace(" ", "T") + "Z");
  } else {
    parsedDate = new Date(date);
  }

  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: APP_TIMEZONE,
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(parsedDate) + " WIB"
  );
}
