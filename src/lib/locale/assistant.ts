import type { Locale } from "../language";

export type AssistantCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  checking: string;
  introEyebrow: string;
  introTitle: string;
  introLead: string;
  privacy1: string;
  privacy2: string;
  privacy3: string;
  connectTitle: string;
  connectLead: string;
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  keyNote: string;
  connectBtn: string;
  checkingBtn: string;
  working: string;
  slow: string;
  down: string;
  chooseShare: string;
  chooseShareLead: string;
  ctxPlan: string;
  ctxPlanDesc: string;
  ctxTasks: string;
  ctxTasksDesc: string;
  ctxAnswers: string;
  ctxAnswersDesc: string;
  ctxJournal: string;
  ctxJournalDesc: string;
  available: (n: number) => string;
  focusLabel: string;
  focusOptional: string;
  focusPlaceholder: string;
  needContent: string;
  disconnect: string;
  analyze: string;
  thinking: string;
  sendNote: string;
  tentativeRead: string;
  basedOn: string;
  smallStep: string;
  addToday: string;
  oneQuestion: string;
  talkTitle: string;
  talkLead: string;
  you: string;
  ai: string;
  followUp: string;
  followUpPlaceholder: string;
  sendMessage: string;
  emptyTitle: string;
  emptyLead: string;
  connected: string;
};

const en: AssistantCopy = {
  eyebrow: "OPTIONAL GUIDANCE, ON YOUR TERMS",
  title: "AI guide",
  lead: "Look for patterns and turn them into small, reviewable suggestions.",
  checking: "Checking your AI connection…",
  introEyebrow: "A SECOND SET OF EYES",
  introTitle: "Thoughtful suggestions, only when you ask.",
  introLead:
    "The guide can compare your direction, daily actions, and any reflections you choose to share. Its output is a draft. You decide what belongs in your life.",
  privacy1: "Nothing is sent automatically",
  privacy2: "You choose each category",
  privacy3: "Suggestions never change your plan",
  connectTitle: "Connect your AI provider",
  connectLead:
    "OpenAI, DeepSeek, NVIDIA, Groq, Hugging Face, OpenRouter, or another compatible API.",
  provider: "Provider",
  apiKey: "API key",
  model: "Model",
  baseUrl: "API base URL",
  keyNote:
    "The key is validated server-side and stored in an encrypted HttpOnly session cookie. It is not saved in LifeOS data or exports.",
  connectBtn: "Connect securely",
  checkingBtn: "Checking…",
  working: "Working",
  slow: "Slow response",
  down: "Connection down",
  chooseShare: "Choose what to share",
  chooseShareLead: "Only selected content is sent when you press Analyze.",
  ctxPlan: "My direction",
  ctxPlanDesc: "Your six plan fields",
  ctxTasks: "Daily steps",
  ctxTasksDesc: "Active steps and today’s completion",
  ctxAnswers: "Reset answers",
  ctxAnswersDesc: "Your private guided-reflection answers",
  ctxJournal: "Journal reflections",
  ctxJournalDesc: "Up to the 20 most recent notes",
  available: (n) => `${n} available`,
  focusLabel: "What would you like help with?",
  focusOptional: "(optional)",
  focusPlaceholder:
    "For example: Help me make this month realistic, or spot where my actions don’t match my direction.",
  needContent:
    "Add a daily step, direction, reset answer, or reflection before requesting analysis.",
  disconnect: "Disconnect key",
  analyze: "Analyze selected context",
  thinking: "Thinking…",
  sendNote:
    "Selected text is sent to your provider for this request. LifeOS does not save the analysis.",
  tentativeRead: "A TENTATIVE READ",
  basedOn: "Based on:",
  smallStep: "A SMALL NEXT STEP",
  addToday: "Add to Today",
  oneQuestion: "ONE QUESTION TO KEEP",
  talkTitle: "Talk it through",
  talkLead:
    "Ask a follow-up about the context you selected. This conversation stays only in this page session.",
  you: "You",
  ai: "AI",
  followUp: "Your follow-up",
  followUpPlaceholder: "What would be a realistic first step this week?",
  sendMessage: "Send message",
  emptyTitle: "Your words come first.",
  emptyLead:
    "Select the context you’re comfortable sharing, then ask for a fresh perspective.",
  connected: "Connected",
};

const ar: AssistantCopy = {
  eyebrow: "إرشاد اختياري، بشروطك",
  title: "دليل الذكاء الاصطناعي",
  lead: "ابحث عن أنماط وحوّلها إلى اقتراحات صغيرة يمكن مراجعتها.",
  checking: "جاري التحقق من اتصال الذكاء الاصطناعي…",
  introEyebrow: "نظرة ثانية عند الطلب",
  introTitle: "اقتراحات مدروسة، فقط عندما تسأل.",
  introLead:
    "يمكن للدليل مقارنة اتجاهك وخطواتك وأي تأملات تختار مشاركتها. الناتج مسودة. أنت من يقرر ما يدخل حياتك.",
  privacy1: "لا يُرسل شيء تلقائياً",
  privacy2: "أنت تختار كل فئة",
  privacy3: "الاقتراحات لا تغيّر خطتك",
  connectTitle: "ربط مزود الذكاء الاصطناعي",
  connectLead:
    "OpenAI أو DeepSeek أو NVIDIA أو Groq أو Hugging Face أو OpenRouter أو واجهة متوافقة.",
  provider: "المزود",
  apiKey: "مفتاح API",
  model: "النموذج",
  baseUrl: "رابط API الأساسي",
  keyNote:
    "يُتحقق من المفتاح على الخادم ويُخزَّن في جلسة مشفرة. لا يُحفظ في بيانات LifeOS أو النسخ الاحتياطية.",
  connectBtn: "اتصال آمن",
  checkingBtn: "جاري التحقق…",
  working: "يعمل",
  slow: "استجابة بطيئة",
  down: "الاتصال معطّل",
  chooseShare: "اختر ما تشاركه",
  chooseShareLead: "يُرسل المحدد فقط عند الضغط على «تحليل».",
  ctxPlan: "اتجاهي",
  ctxPlanDesc: "حقول خطتك الستة",
  ctxTasks: "خطوات اليوم",
  ctxTasksDesc: "الخطوات النشطة وإنجاز اليوم",
  ctxAnswers: "إجابات التغيير",
  ctxAnswersDesc: "إجابات التأمل الخاصة",
  ctxJournal: "تأملات اليومية",
  ctxJournalDesc: "حتى 20 ملاحظة حديثة",
  available: (n) => `${n} متاح`,
  focusLabel: "بماذا تريد المساعدة؟",
  focusOptional: "(اختياري)",
  focusPlaceholder:
    "مثال: اجعل مشروع هذا الشهر واقعياً، أو لاحظ أين أفعالي لا تطابق اتجاهي.",
  needContent:
    "أضف خطوة يومية أو اتجاهاً أو إجابة تأمل قبل طلب التحليل.",
  disconnect: "قطع الاتصال",
  analyze: "تحليل السياق المحدد",
  thinking: "جاري التفكير…",
  sendNote:
    "يُرسل النص المحدد إلى مزودك لهذا الطلب. LifeOS لا يحفظ التحليل.",
  tentativeRead: "قراءة مبدئية",
  basedOn: "استناداً إلى:",
  smallStep: "خطوة صغيرة تالية",
  addToday: "إضافة إلى اليوم",
  oneQuestion: "سؤال واحد للاحتفاظ به",
  talkTitle: "تابع الحوار",
  talkLead:
    "اسأل متابعة عن السياق الذي اخترته. يبقى الحوار في هذه الجلسة فقط.",
  you: "أنت",
  ai: "الذكاء الاصطناعي",
  followUp: "متابعتك",
  followUpPlaceholder: "ما أول خطوة واقعية هذا الأسبوع؟",
  sendMessage: "إرسال",
  emptyTitle: "كلماتك أولاً.",
  emptyLead: "اختر السياق الذي يريحك، ثم اطلب منظوراً جديداً.",
  connected: "متصل",
};

export function assistantCopy(locale: Locale): AssistantCopy {
  return locale === "ar" ? ar : en;
}
