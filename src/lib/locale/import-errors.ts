import type { Locale } from "../language";

const IMPORT_ERROR_EN = {
  notBackup: "This file does not contain a LifeOS backup.",
  invalidOptions: "The backup contains invalid selected options.",
  invalidProfile: "The backup contains an invalid assessment profile.",
  duplicateTasks: "The backup contains duplicate task IDs.",
  unsupportedVersion:
    "Unsupported backup version. Your current data has been kept.",
  incomplete:
    "The backup is incomplete or contains invalid data. Your current data has been kept.",
} as const;

const IMPORT_ERROR_AR: Record<keyof typeof IMPORT_ERROR_EN, string> = {
  notBackup: "هذا الملف لا يحتوي على نسخة احتياطية من لايف أو إس.",
  invalidOptions: "النسخة الاحتياطية تحتوي على خيارات محددة غير صالحة.",
  invalidProfile: "النسخة الاحتياطية تحتوي على ملف تأمل غير صالح.",
  duplicateTasks: "النسخة الاحتياطية تحتوي على معرّفات مهام مكررة.",
  unsupportedVersion:
    "إصدار النسخة الاحتياطية غير مدعوم. تم الاحتفاظ ببياناتك الحالية.",
  incomplete:
    "النسخة الاحتياطية ناقصة أو تحتوي على بيانات غير صالحة. تم الاحتفاظ ببياناتك الحالية.",
};

export function displayImportError(error: unknown, locale: Locale): string {
  const message = error instanceof Error ? error.message : "";
  const map: Record<string, keyof typeof IMPORT_ERROR_EN> = {
    [IMPORT_ERROR_EN.notBackup]: "notBackup",
    [IMPORT_ERROR_EN.invalidOptions]: "invalidOptions",
    [IMPORT_ERROR_EN.invalidProfile]: "invalidProfile",
    [IMPORT_ERROR_EN.duplicateTasks]: "duplicateTasks",
    [IMPORT_ERROR_EN.unsupportedVersion]: "unsupportedVersion",
    [IMPORT_ERROR_EN.incomplete]: "incomplete",
  };
  const key = map[message];
  if (!key) return message;
  return locale === "ar" ? IMPORT_ERROR_AR[key] : IMPORT_ERROR_EN[key];
}
