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
  icsSummary: string;
  icsProdId: string;
  ariaResetPhases: string;
  ariaPhaseGuidance: string;
  ariaReflectionTime: (n: number) => string;
  ariaReflectOn: (prompt: string) => string;
  ariaChooseContent: string;
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
  dataTitle: string;
  dataLead: string;
  exportBackup: string;
  importBackup: string;
  exportRaw: string;
  exportLegacy: string;
  recoverWorkspace: string;
  backupSizeError: string;
  backupReadError: string;
  storageUnavailable: string;
  legacyExportError: string;
  confirmRecover: string;
  recoveredNotice: string;
  recoveryFailed: string;
  archivedStepsTitle: string;
  bringBack: string;
  freshChapterTitle: string;
  freshChapterLead: string;
  resetWorkspace: string;
  motiveLabel: string;
  discPaceLabel: string;
  needLabel: string;
  consciousnessLabel: string;
  motives: Record<"red" | "blue" | "white" | "yellow", string>;
  needs: Record<"freedom" | "structure" | "empathy" | "esteem", string>;
  discStyles: Record<"D" | "I" | "S" | "C", string>;
  translateTitle: string;
  translateLead: string;
  useDirection: string;
  useSteps: string;
  useReflection: string;
  textToTranslate: string;
  translatePlaceholder: string;
  translateTo: string;
  translateButton: string;
  translating: string;
  translationResult: string;
  detectedLanguage: string;
  translateKeyNote: string;
  translationLanguages: Record<string, string>;
  planFieldNames: Record<string, string>;
  stepWord: (n: number) => string;
  reflectionWord: (n: number) => string;
  actionWord: (n: number) => string;
  answerWord: (n: number) => string;
  fieldsFilled: (filled: number, total: number) => string;
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
  icsSummary: "LifeOS - A mindful pause",
  icsProdId: "-//LifeOS//Reflection day//EN",
  ariaResetPhases: "Reset phases",
  ariaPhaseGuidance: "Guidance for this phase",
  ariaReflectionTime: (n) => `Time for reflection ${n}`,
  ariaReflectOn: (prompt) => `Reflect: ${prompt}`,
  ariaChooseContent: "Choose LifeOS content",
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
  dataTitle: "Your data belongs to you",
  dataLead:
    "No account or cloud connection is required. Browser storage is not encrypted; use a trusted device. Clearing browser data removes your workspace.",
  exportBackup: "Export backup",
  importBackup: "Import backup",
  exportRaw: "Export raw saved data",
  exportLegacy: "Export legacy v1 data",
  recoverWorkspace: "Recover previous workspace",
  backupSizeError: "Please use a backup smaller than 5 MB.",
  backupReadError: "Could not read this backup.",
  storageUnavailable:
    "Browser storage is unavailable. You can still export the loaded backup above.",
  legacyExportError: "Could not export legacy data.",
  confirmRecover:
    "Restore the backup from before your last reset or import? This replaces your current workspace.",
  recoveredNotice: "Previous data restored.",
  recoveryFailed: "Recovery failed.",
  archivedStepsTitle: "Archived steps",
  bringBack: "Bring back",
  freshChapterTitle: "A fresh chapter",
  freshChapterLead:
    "Start over with a blank plan. We’ll keep a recovery copy of your previous workspace.",
  resetWorkspace: "Reset workspace",
  motiveLabel: "Core Motive",
  discPaceLabel: "DISC Pace",
  needLabel: "Primary Need",
  consciousnessLabel: "Consciousness",
  motives: {
    red: "Red: Power / Results",
    blue: "Blue: Connection / Care",
    white: "White: Peace / Clarity",
    yellow: "Yellow: Fun / Vitality",
  },
  needs: {
    freedom: "Freedom / Autonomy",
    structure: "Structure / Order",
    empathy: "Empathy / Care",
    esteem: "Esteem / Respect",
  },
  discStyles: {
    D: "D (Direct & Fast)",
    I: "I (Inspiring & Social)",
    S: "S (Steady & Supportive)",
    C: "C (Conscientious & Analytical)",
  },
  translateTitle: "Translate your writing",
  translateLead:
    "Translate only the text you choose. Your original LifeOS writing is never changed or saved to Google Translate.",
  useDirection: "Use my direction",
  useSteps: "Use active steps",
  useReflection: "Use latest reflection",
  textToTranslate: "Text to translate",
  translatePlaceholder: "Write or choose something from your LifeOS workspace…",
  translateTo: "Translate to",
  translateButton: "Translate with Google",
  translating: "Translating…",
  translationResult: "Translation",
  detectedLanguage: "detected",
  translateKeyNote:
    "Google Cloud Translation must be enabled and GOOGLE_TRANSLATE_API_KEY configured on the LifeOS server. Translation use is subject to your Google Cloud billing and data controls.",
  translationLanguages: {
    ar: "Arabic",
    en: "English",
    fr: "French",
    de: "German",
    hi: "Hindi",
    id: "Indonesian",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    pt: "Portuguese",
    es: "Spanish",
    tr: "Turkish",
    ur: "Urdu",
    "zh-CN": "Chinese (Simplified)",
  },
  planFieldNames: {
    vision: "Vision",
    antiVision: "Anti-vision",
    identity: "Identity",
    year: "Year outcome",
    month: "Month project",
    constraints: "Protected constraints",
  },
  stepWord: (n) => `${n} ${n === 1 ? "step" : "steps"}`,
  reflectionWord: (n) => `${n} ${n === 1 ? "note" : "notes"}`,
  actionWord: (n) => `${n} daily ${n === 1 ? "action" : "actions"}`,
  answerWord: (n) => `${n} ${n === 1 ? "answer" : "answers"} saved`,
  fieldsFilled: (filled, total) => `${filled} of ${total} fields filled`,
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
    "خط الأساس وخيارات MSQ للتأمل الشخصي والتعلم فقط. ليست تقييمات طبية أو سريرية أو وظيفية.",
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
  icsSummary: "لايف أو إس — وقفة واعية",
  icsProdId: "-//LifeOS//يوم التأمل//AR",
  ariaResetPhases: "مراحل التغيير",
  ariaPhaseGuidance: "إرشاد هذه المرحلة",
  ariaReflectionTime: (n) => `وقت التأمل ${n}`,
  ariaReflectOn: (prompt) => `تأمّل: ${prompt}`,
  ariaChooseContent: "اختر محتوى لايف أو إس",
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
  dataTitle: "بياناتك ملكك وحدك",
  dataLead:
    "لا حاجة لحساب أو اتصال سحابي. تخزين المتصفح غير مشفر؛ استخدم جهازاً موثوقاً. مسح بيانات المتصفح يحذف مساحة عملك.",
  exportBackup: "تصدير نسخة احتياطية",
  importBackup: "استيراد نسخة احتياطية",
  exportRaw: "تصدير البيانات الخام المحفوظة",
  exportLegacy: "تصدير بيانات الإصدار السابق (v1)",
  recoverWorkspace: "استعادة مساحة العمل السابقة",
  backupSizeError: "يرجى استخدام نسخة احتياطية أصغر من 5 ميغابايت.",
  backupReadError: "تعذّرت قراءة هذه النسخة الاحتياطية.",
  storageUnavailable:
    "تخزين المتصفح غير متاح. لا يزال بإمكانك تصدير النسخة الاحتياطية المحملة أعلاه.",
  legacyExportError: "تعذّر تصدير بيانات الإصدار السابق.",
  confirmRecover:
    "هل تريد استعادة النسخة الاحتياطية من قبل آخر إعادة ضبط أو استيراد؟ سيؤدي هذا إلى استبدال مساحة عملك الحالية.",
  recoveredNotice: "تمت استعادة البيانات السابقة.",
  recoveryFailed: "فشلت الاستعادة.",
  archivedStepsTitle: "الخطوات المؤرشفة",
  bringBack: "استعادة",
  freshChapterTitle: "فصل جديد",
  freshChapterLead:
    "ابدأ من جديد بخطة فارغة. سنحتفظ بنسخة استرداد لمساحة عملك السابقة.",
  resetWorkspace: "إعادة ضبط مساحة العمل",
  motiveLabel: "الدافع الأساسي",
  discPaceLabel: "إيقاع التنفيذ (DISC)",
  needLabel: "الاحتياج الأساسي",
  consciousnessLabel: "مستوى الوعي",
  motives: {
    red: "أحمر: إنجاز وقوة",
    blue: "أزرق: معنى وترابط",
    white: "أبيض: سلام ووضوح",
    yellow: "أصفر: حيوية ومرح",
  },
  needs: {
    freedom: "حرية واستقلال",
    structure: "بنية وتنظيم",
    empathy: "تعاطف وتفهم",
    esteem: "تقدير واحترام",
  },
  discStyles: {
    D: "D (مباشر وسريع)",
    I: "I (مُلهم واجتماعي)",
    S: "S (ثابت وداعم)",
    C: "C (دقيق وتحليلي)",
  },
  translateTitle: "ترجمة كتابتك",
  translateLead:
    "ترجم فقط النص الذي تختاره من مساحة عملك. كتابتك الأصلية في LifeOS لا تتغير ولا تُحفظ في Google Translate.",
  useDirection: "استخدام اتجاهي",
  useSteps: "استخدام الخطوات النشطة",
  useReflection: "استخدام آخر تأمل",
  textToTranslate: "النص المراد ترجمته",
  translatePlaceholder: "اكتب أو اختر نصاً من مساحة عملك في LifeOS…",
  translateTo: "الترجمة إلى",
  translateButton: "ترجمة عبر Google",
  translating: "جاري الترجمة…",
  translationResult: "الترجمة",
  detectedLanguage: "تم التعرف على",
  translateKeyNote:
    "يجب تفعيل Google Cloud Translation وضبط مفتاح GOOGLE_TRANSLATE_API_KEY على خادم LifeOS. يخضع الاستخدام لفواتير وإعدادات بيانات Google Cloud الخاصة بك.",
  translationLanguages: {
    ar: "العربية",
    en: "الإنجليزية",
    fr: "الفرنسية",
    de: "الألمانية",
    hi: "الهندية",
    id: "الإندونيسية",
    it: "الإيطالية",
    ja: "اليابانية",
    ko: "الكورية",
    pt: "البرتغالية",
    es: "الإسبانية",
    tr: "التركية",
    ur: "الأردية",
    "zh-CN": "الصينية (المبسطة)",
  },
  planFieldNames: {
    vision: "الرؤية",
    antiVision: "الرؤية المضادة",
    identity: "الهوية والتدرّب",
    year: "نتيجة العام",
    month: "مشروع الشهر",
    constraints: "الحدود والالتزامات",
  },
  stepWord: (n) => `${n} ${n === 1 ? "خطوة" : "خطوات"}`,
  reflectionWord: (n) => `${n} ${n === 1 ? "ملاحظة" : "ملاحظات"}`,
  actionWord: (n) => `${n} ${n === 1 ? "خطوة يومية" : "خطوات يومية"}`,
  answerWord: (n) => `${n} ${n === 1 ? "إجابة محفوظة" : "إجابات محفوظة"}`,
  fieldsFilled: (filled, total) => `${filled} من ${total} حقول مكتملة`,
};

export function workspaceCopy(locale: Locale): WorkspaceCopy {
  return locale === "ar" ? ar : en;
}
