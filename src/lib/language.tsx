"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "ar";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  tr: (english: string, arabic?: string) => string;
  dateLocale: "en-US" | "ar-SA";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const arabicCopy: Record<string, string> = {
  "Your journey guide": "دليل رحلتك",
  "WELCOME TO LIFEOS": "مرحباً بك في لايف أو إس",
  "A LITTLE GUIDANCE": "قليل من الإرشاد",
  "A starting point, even if you don’t have a plan.": "نقطة بداية، حتى إن لم تكن لديك خطة.",
  "LifeOS helps you explore what you want to change, choose a direction, and practice it through small daily actions. We’ll explain each step as you go. No background reading needed.": "يساعدك لايف أو إس على استكشاف ما تريد تغييره، واختيار اتجاه، وممارسته عبر أفعال يومية صغيرة. سنشرح كل خطوة أثناء تقدمك.",
  "Suggested next step": "الخطوة التالية المقترحة",
  "Hide the walkthrough": "إخفاء الدليل",
  "Show the walkthrough": "إظهار الدليل",
  "Journey steps": "خطوات الرحلة",
  "Try this:": "جرّب هذا:",
  "Move at your own pace. You can visit any section and revise your answers. AI guide is optional; Settings & data holds your backups.": "تقدّم وفق إيقاعك الخاص. يمكنك زيارة أي قسم ومراجعة إجاباتك. دليل الذكاء الاصطناعي اختياري، وتوجد نسخك الاحتياطية في الإعدادات والبيانات.",
  "Where this journey comes from": "مصدر هذه الرحلة",
  "Read the original article": "اقرأ المقال الأصلي",
  "Notice": "لاحظ",
  "Choose": "اختر",
  "Practice": "مارس",
  "Learn": "تعلّم",
  "Your reset": "مساحتك للتغيير",
  "My direction": "اتجاهي",
  "Today": "اليوم",
  "Reflections": "تأملات",
  "Explore what you want to change.": "استكشف ما تريد تغييره.",
  "Turn your answers into a plan.": "حوّل إجاباتك إلى خطة.",
  "Take one manageable action.": "اتخذ فعلاً واحداً يمكن إنجازه.",
  "Notice what to adjust next.": "لاحظ ما يمكن تعديله لاحقاً.",
};

function preferredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("lifeos_locale");
  if (saved === "ar" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(preferredLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lifeos_locale", locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      tr: (english, arabic) =>
        locale === "ar" ? arabic ?? arabicCopy[english] ?? english : english,
      dateLocale: locale === "ar" ? "ar-SA" : "en-US",
    }),
    [locale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
