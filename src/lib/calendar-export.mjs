export function escapeIcsText(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildIcsCalendar({
  summary,
  prodId,
  resetDate,
  reminderTimes,
  descriptions,
  now = new Date(),
}) {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = descriptions.map((description, index) =>
    [
      "BEGIN:VEVENT",
      `UID:${resetDate}-${index}@lifeos.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${resetDate.replace(/-/g, "")}T${reminderTimes[index].replace(":", "")}00`,
      "DURATION:PT5M",
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      "BEGIN:VALARM",
      "TRIGGER:PT0M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(description)}`,
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n"),
  );
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
