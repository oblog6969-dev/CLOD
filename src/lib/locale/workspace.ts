import type { Locale } from "../language";

export type WorkspaceCopy = {
  taskIntro: string;
  taskLabel: string;
  taskPlaceholder: string;
  taskTimeLabel: string;
  taskTimeOptional: string;
  saveStep: string;
  archiveStep: string;
  stepArchived: string;
  stepReady: string;
  resetEyebrow: string;
  resetTitle: string;
  resetLead: string;
  resetTag: string;
  phaseMorning: string;
  phaseMorningSub: string;
  phaseDay: string;
  phaseDaySub: string;
  phaseEvening: string;
  phaseEveningSub: string;
  msqSelectAll: string;
  msqSelectOne: string;
  msqFrameworkMode: string;
  msqGenerateAi: string;
  msqGenerating: string;
  msqAiFallback: string;
  msqYourAnswer: string;
  msqPlaceholderNuance: string;
  msqPlaceholderOpen: string;
  msqChosenCount: (n: number) => string;
  msqSavedHint: string;
  msqSaveContinue: string;
  msqEducationalNote: string;
  planDraftFromReset: string;
  reviewPlanDraft: string;
  checkInTitle: string;
  settingsPsychDisclaimer: string;
  assessmentDisclaimer: string;
  maslowCenterLabel: string;
  maslowOrientationLabel: string;
  phaseMorningTitle: string;
  phaseMorningExplain: string;
  phaseMorningRec: string;
  phaseDayTitle: string;
  phaseDayExplain: string;
  phaseDayRec: string;
  phaseEveningTitle: string;
  phaseEveningExplain: string;
  phaseEveningRec: string;
  tryThis: string;
  answerSaved: string;
  previous: string;
  skipForNow: string;
  privacyReset: string;
  explored: string;
  questionOf: (n: number, total: number) => string;
  attunedTo: string;
  msqActive: string;
  recalibrate: string;
  tiredTyping: string;
  assessmentInvite: string;
  takeAssessment: string;
  dayPauseTitle: string;
  dayPauseLead: string;
  reflectionDayLabel: string;
  exportReminders: string;
  enterEvening: string;
  calendarExported: string;
  handoffTitle: string;
  handoffLead: string;
  continuePlan: string;
  sourceAdaptation: string;
  settingsEyebrow: string;
  settingsTitle: string;
  settingsLead: string;
  personalTouch: string;
  nameLabel: string;
  namePlaceholder: string;
  saveName: string;
  nameSaved: string;
  retakeAssessment: string;
  devSectionTitle: string;
  devSectionLead: string;
  yourArchetype: string;
};

const en: WorkspaceCopy = {
  taskIntro:
    "Make it specific, kind, and small enough to start. This step repeats daily until you archive it.",
  taskLabel: "What will you do?",
  taskPlaceholder: "e.g. Take a 15-minute walk after lunch",
  taskTimeLabel: "Make time for it",
  taskTimeOptional: "(optional)",
  saveStep: "Save step",
  archiveStep: "Archive step",
  stepArchived: "Step archived. Your past progress is kept.",
  stepReady: "Your step is ready for today.",
  resetEyebrow: "ONE DAY. A CLEARER DIRECTION.",
  resetTitle: "Your reset",
  resetLead: "Reflection today. Small changes over time. Pause and return whenever you need.",
  resetTag: "Each answer saved separately",
  phaseMorning: "Morning",
  phaseMorningSub: "Make space · 15–30 min",
  phaseDay: "Throughout the day",
  phaseDaySub: "Notice your patterns",
  phaseEvening: "Evening",
  phaseEveningSub: "Find your next direction",
  msqSelectAll: "Select all that resonate",
  msqSelectOne: "Choose the closest match",
  msqFrameworkMode: "Framework MSQ Mode",
  msqGenerateAi: "Generate AI-tailored choices",
  msqGenerating: "Generating options with AI…",
  msqAiFallback: "Could not reach AI provider. Showing calibrated archetype options.",
  msqYourAnswer: "Your answer",
  msqPlaceholderNuance: "Or reflect in your own words / add personal nuance…",
  msqPlaceholderOpen: "Take your time. Start wherever you are…",
  msqChosenCount: (n) =>
    `${n} chosen. Press continue when ready.`,
  msqSavedHint: "Saved when you leave this field or continue.",
  msqSaveContinue: "Save & continue",
  msqEducationalNote:
    "Choices are learning prompts inspired by reflection frameworks — not diagnoses or scores.",
  planDraftFromReset: "Review direction draft",
  reviewPlanDraft: "Review plan draft from your reset",
  checkInTitle: "Mindful pause",
  settingsPsychDisclaimer:
    "Baseline and MSQ choices are for personal reflection and learning. They are not medical, clinical, or employment assessments.",
  assessmentDisclaimer:
    "For your own reflection and learning only. Results are illustrative combinations of your answers, not a diagnosis or official test score.",
  maslowCenterLabel: "Maslow center of gravity",
  maslowOrientationLabel: "Need orientation",
  phaseMorningTitle: "1. Explore what you want to change",
  phaseMorningExplain:
    "Begin by noticing your current patterns and what you want your future to look like. You are gathering ideas; you do not need a finished plan.",
  phaseMorningRec:
    "Start with a recent everyday moment. A phrase or a few words is enough to begin.",
  phaseDayTitle: "2. Notice your day as it happens",
  phaseDayExplain:
    "Pause during ordinary activities and compare where your attention went with where you wanted it to go.",
  phaseDayRec:
    "Choose reminder times that fit your day. Export them to your calendar, or use the reflection buttons here.",
  phaseEveningTitle: "3. Turn what you noticed into a direction",
  phaseEveningExplain:
    "Look for what you want to leave behind, what you want to move toward, and a small next step. You can review an editable plan draft after these questions.",
  phaseEveningRec:
    "Use something you actually noticed today. Your first direction is allowed to be provisional.",
  tryThis: "Try this:",
  answerSaved: "Answer saved.",
  previous: "Previous",
  skipForNow: "Skip for now",
  privacyReset:
    "These answers are for you. Use your own words; you don’t have to answer everything.",
  explored: "explored",
  questionOf: (n, total) => `QUESTION ${n} OF ${total}`,
  attunedTo: "Attuned to",
  msqActive: "Quick-tap choices active",
  recalibrate: "Recalibrate",
  tiredTyping: "Prefer tapping to typing?",
  assessmentInvite:
    "Take the short baseline to unlock reflection choices tuned to your patterns.",
  takeAssessment: "Take baseline",
  dayPauseTitle: "A few pauses can change the shape of a day.",
  dayPauseLead:
    "Adjust these times to your schedule. Export reminders to your calendar so they work when this app is closed.",
  reflectionDayLabel: "Your reflection day",
  exportReminders: "Export reminders",
  enterEvening: "Enter evening reflection",
  calendarExported:
    "Calendar file downloaded. Import it in your calendar to enable reminders.",
  handoffTitle: "Ready to connect your answers?",
  handoffLead:
    "My direction brings your ideas into a plan you can revise. You can go there before answering everything.",
  continuePlan: "Continue to your plan",
  sourceAdaptation:
    "An original guided adaptation of Dan Koe’s one-day protocol. A tool for reflection, not a promise to transform everything overnight.",
  settingsEyebrow: "YOUR SPACE, YOUR CHOICE",
  settingsTitle: "Make yourself at home",
  settingsLead:
    "Your reflections stay in this browser. Back them up when they matter to you.",
  personalTouch: "A personal touch",
  nameLabel: "What should we call you?",
  namePlaceholder: "Your first name",
  saveName: "Save name",
  nameSaved: "Your name is saved.",
  retakeAssessment: "Retake baseline",
  devSectionTitle: "Human development & reflection",
  devSectionLead:
    "Educational models (Hartman, DISC, Birkman, values, Maslow tiers) shape tap choices—not clinical scores.",
  yourArchetype: "YOUR REFLECTION PROFILE",
};

const ar: WorkspaceCopy = {
  taskIntro:
    "اجعلها محددة ولطيفة وصغيرة بما يكفي للبدء. تتكرر هذه الخطوة يومياً حتى تؤرشفها.",
  taskLabel: "ماذا ستفعل؟",
  taskPlaceholder: "مثال: تمشّ 15 دقيقة بعد الغداء",
  taskTimeLabel: "خصّص وقتاً لها",
  taskTimeOptional: "(اختياري)",
  saveStep: "حفظ الخطوة",
  archiveStep: "أرشفة الخطوة",
  stepArchived: "تمت أرشفة الخطوة. يبقى سجل تقدمك السابق.",
  stepReady: "خطوتك جاهزة لليوم.",
  resetEyebrow: "يوم واحد. اتجاه أوضح.",
  resetTitle: "مساحتك للتغيير",
  resetLead: "تأمل اليوم. تغييرات صغيرة مع الوقت. توقف وعد متى احتجت.",
  resetTag: "كل إجابة تُحفظ على حدة",
  phaseMorning: "الصباح",
  phaseMorningSub: "اصنع مساحة · 15–30 دقيقة",
  phaseDay: "خلال اليوم",
  phaseDaySub: "لاحظ أنماطك",
  phaseEvening: "المساء",
  phaseEveningSub: "حدّد اتجاهك التالي",
  msqSelectAll: "اختر كل ما يلقى صدى",
  msqSelectOne: "اختر الأقرب لك",
  msqFrameworkMode: "وضع الخيارات الإطارية",
  msqGenerateAi: "توليد خيارات مخصّصة بالذكاء الاصطناعي",
  msqGenerating: "جاري توليد الخيارات…",
  msqAiFallback: "تعذّر الاتصال بالمزود. نعرض خيارات مُعايرة لنمطك.",
  msqYourAnswer: "إجابتك",
  msqPlaceholderNuance: "أو عبّر بكلماتك / أضف لمسة شخصية…",
  msqPlaceholderOpen: "خذ وقتك. ابدأ من حيث أنت…",
  msqChosenCount: (n) => `${n} مختار. اضغط متابعة عندما تكون جاهزاً.`,
  msqSavedHint: "يُحفظ عند مغادرة الحقل أو المتابعة.",
  msqSaveContinue: "حفظ ومتابعة",
  msqEducationalNote:
    "الخيارات تعليمية مستوحاة من أطر التأمل — وليست تشخيصاً أو درجة رسمية.",
  planDraftFromReset: "مراجعة مسودة الاتجاه",
  reviewPlanDraft: "راجع مسودة الخطة من جلسة التغيير",
  checkInTitle: "وقفة وعي",
  settingsPsychDisclaimer:
    "خط الأساس وخيارات MSQ للتأمل الشخصي والتعلم فقط. ليست تقييمات طبية أو سرية أو وظيفية.",
  assessmentDisclaimer:
    "للتأمل والتعلم الشخصي فقط. النتائج تركيبة توضيحية لإجاباتك، وليست تشخيصاً أو نتيجة اختبار رسمي.",
  maslowCenterLabel: "مركز جاذبية الاحتياجات (ماسلو)",
  maslowOrientationLabel: "توجّه الاحتياجات",
  phaseMorningTitle: "1. استكشف ما تريد تغييره",
  phaseMorningExplain:
    "ابدأ بملاحظة أنماطك الحالية وما تريد أن يبدو عليه مستقبلك. تجمع أفكاراً؛ لا تحتاج خطة جاهزة.",
  phaseMorningRec: "ابدأ بلحظة يومية حديثة. عبارة أو كلمات قليلة تكفي للبدء.",
  phaseDayTitle: "2. لاحظ يومك كما يمر",
  phaseDayExplain:
    "توقّف أثناء الأنشطة العادية وقارن أين ذهب انتباهك بما أردته.",
  phaseDayRec:
    "اختر أوقات تذكير تناسب يومك. صدّرها للتقويم أو استخدم أزرار التأمل هنا.",
  phaseEveningTitle: "3. حوّل ما لاحظته إلى اتجاه",
  phaseEveningExplain:
    "ابحث عما تريد تركه وما تتجه إليه وخطوة صغيرة تالية. يمكنك مراجعة مسودة خطة بعد الأسئلة.",
  phaseEveningRec: "استخدم شيئاً لاحظته اليوم فعلاً. اتجاهك الأول يمكن أن يكون مؤقتاً.",
  tryThis: "جرّب هذا:",
  answerSaved: "تم حفظ الإجابة.",
  previous: "السابق",
  skipForNow: "تخطّ الآن",
  privacyReset: "إجاباتك لك. استخدم كلماتك؛ لا يلزم الإجابة على كل شيء.",
  explored: "تم استكشافها",
  questionOf: (n, total) => `سؤال ${n} من ${total}`,
  attunedTo: "مُعاير لـ",
  msqActive: "خيارات النقر السريع مفعّلة",
  recalibrate: "إعادة المعايرة",
  tiredTyping: "تفضّل النقر بدل الكتابة الطويلة؟",
  assessmentInvite:
    "خذ خط الأساس القصير لفتح خيارات تأمل مُعايرة لأنماطك.",
  takeAssessment: "ابدأ خط الأساس",
  dayPauseTitle: "بضع وقفات قد تغيّر شكل يومك.",
  dayPauseLead:
    "اضبط الأوقات على جدولك. صدّر التذكيرات إلى تقويمك لتعمل عند إغلاق التطبيق.",
  reflectionDayLabel: "يوم التأمل",
  exportReminders: "تصدير التذكيرات",
  enterEvening: "الانتقال لتأمل المساء",
  calendarExported:
    "تم تنزيل ملف التقويم. استورده في تقويمك لتفعيل التذكيرات.",
  handoffTitle: "جاهز لربط إجاباتك؟",
  handoffLead:
    "صفحة اتجاهي تحوّل أفكارك إلى خطة يمكن مراجعتها. يمكنك الذهاب إليها قبل إنهاء كل الأسئلة.",
  continuePlan: "متابعة إلى خطتي",
  sourceAdaptation:
    "تكييف إرشادي مستقل مستوحى من بروتوكول دان كو ليوم واحد. أداة تأمل، لا وعد بتحوّل بين عشية وضحاها.",
  settingsEyebrow: "مساحتك، اختيارك",
  settingsTitle: "اجعلها مكانك",
  settingsLead: "تأملاتك تبقى في هذا المتصفح. احفظ نسخة عندما تهمك.",
  personalTouch: "لمسة شخصية",
  nameLabel: "بماذا نناديك؟",
  namePlaceholder: "اسمك الأول",
  saveName: "حفظ الاسم",
  nameSaved: "تم حفظ الاسم.",
  retakeAssessment: "إعادة خط الأساس",
  devSectionTitle: "أطر التطور والتأمل",
  devSectionLead:
    "نماذج تعليمية (Hartman، DISC، Birkman، القيم، مستويات ماسلو) توجّه الخيارات—وليست درجات سريرية.",
  yourArchetype: "ملف تأملك",
};

export function workspaceCopy(locale: Locale): WorkspaceCopy {
  return locale === "ar" ? ar : en;
}
