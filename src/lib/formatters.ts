// Post dates are calendar dates stored as UTC midnight, so format them in UTC;
// otherwise readers west of Greenwich (Brazil, the US) see the previous day.
export function humanDate(date: string | Date) {
  return toDate(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function UTCDate(date: string | Date) {
  return toDate(date).toUTCString()
}

export function ISODate(date: string | Date) {
  return toDate(date).toISOString().split("T")[0]
}

function toDate(date: string | Date) {
  if (!date) return new Date()
  return typeof date === "string" ? new Date(date) : date
}
