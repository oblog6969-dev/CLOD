import type { Locale } from "../language";

const STORAGE_ERROR_EN = {
  corrupt:
    "Your saved data could not be opened. Export the original data below before restoring a backup or starting fresh.",
  saveFailed:
    "Changes could not be saved. Your last saved data is intact. Export a backup or free browser storage before trying again.",
  replaceFailed:
    "Replacement could not be saved. Existing data has been kept.",
} as const;

const STORAGE_ERROR_AR: Record<keyof typeof STORAGE_ERROR_EN, string> = {
  corrupt:
    "تعذّر فتح بياناتك المحفوظة. صدّر البيانات الأصلية أدناه قبل استعادة نسخة احتياطية أو البدء من جديد.",
  saveFailed:
    "تعذّر حفظ التغييرات. آخر نسخة محفوظة سليمة. صدّر نسخة احتياطية أو وفّر مساحة في المتصفح ثم أعد المحاولة.",
  replaceFailed: "تعذّر حفظ الاستبدال. تم الاحتفاظ ببياناتك الحالية.",
};

const EN_TO_KEY = new Map<string, keyof typeof STORAGE_ERROR_EN>(
  Object.entries(STORAGE_ERROR_EN).map(([key, text]) => [
    text,
    key as keyof typeof STORAGE_ERROR_EN,
  ]),
);

export function displayStorageError(message: string, locale: Locale): string {
  if (!message) return message;
  const key = EN_TO_KEY.get(message);
  if (!key) return message;
  return locale === "ar" ? STORAGE_ERROR_AR[key] : STORAGE_ERROR_EN[key];
}
