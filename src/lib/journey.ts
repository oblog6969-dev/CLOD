import { emptyDay, prompts, type Plan, type State } from "./domain";
import type { Locale } from "./language";

export type View =
  "today" | "reset" | "direction" | "journal" | "assistant" | "settings";
export type GuideAction =
  | "reset"
  | "draft"
  | "plan"
  | "task"
  | "checkin"
  | "tasks"
  | "questions"
  | "project"
  | "assistant"
  | "backup";

// Product guidance maps to the existing source adaptation; it is not a score.
export const journeySteps = [
  {
    view: "reset",
    title: "Notice",
    destination: "Your reset",
    description: "Explore what you want to change.",
  },
  {
    view: "direction",
    title: "Choose",
    destination: "My direction",
    description: "Turn your answers into a plan.",
  },
  {
    view: "today",
    title: "Practice",
    destination: "Today",
    description: "Take one manageable action.",
  },
  {
    view: "journal",
    title: "Learn",
    destination: "Reflections",
    description: "Notice what to adjust next.",
  },
] as const;

export const planGuidance: Record<keyof Plan, string> = {
  vision:
    "Vision means the ordinary life you want to move toward. Describe what a good day would include.",
  antiVision:
    "Anti-vision means the future you want to avoid. Name a pattern you would like to change, without judging yourself.",
  identity:
    "Choose a quality you want to practice through your actions. You can try it out and change your mind.",
  year: "Choose one result you could recognize a year from now. It can be provisional.",
  month:
    "Choose a finishable project that supports that result. Add its concrete steps below your plan.",
  constraints:
    "Constraints are your boundaries: what you will protect while making progress, such as rest or time with others.",
};

const explanationsEn: Record<View, { title: string; why: string; tip: string }> = {
  today: {
    title: "Put your direction into practice",
    why: "This is your daily home. Use it to choose and check off a few actions that support your plan.",
    tip: "Start with one action you can name clearly. Choose a time if that helps you begin; you can adjust it later.",
  },
  reset: {
    title: "Get to know your starting point",
    why: "Your reset gives you space to explore your patterns before making a plan. Move through reflection, noticing during the day, and a review of what matters to you.",
    tip: "Begin with one question. A short, honest answer is enough. Skip anything you are not ready to explore and return when it helps.",
  },
  direction: {
    title: "Give your next steps a purpose",
    why: "Keep your desired future, a yearly outcome, a monthly project, and personal boundaries together. Your plan can change as you learn.",
    tip: "Start with the life you want to move toward, then choose one project you could finish this month. Each field below explains what it means.",
  },
  journal: {
    title: "Use experience to adjust your plan",
    why: "Reflections connect what you intended with what actually happened. Your notes and recent actions can help you decide what to keep or change.",
    tip: "Try one sentence: what helped today, what got in the way, or what you want to try differently tomorrow. An empty day needs no catch-up.",
  },
  assistant: {
    title: "Get an optional second perspective",
    why: "The AI guide can help organize answers you choose to share and suggest a next step. You decide what fits and what becomes an action.",
    tip: "Save an answer or action first, then choose only the context you want to discuss. Check suggestions against your own experience. You can use the whole journey without AI.",
  },
  settings: {
    title: "Make this space yours and keep a copy",
    why: "Your workspace is saved in this browser. Here you can set your name, download a backup, and restore your saved work.",
    tip: "Download a backup after a useful session and before changing devices. Importing replaces this workspace; a recovery copy is saved first.",
  },
};

const explanationsAr: Record<View, { title: string; why: string; tip: string }> = {
  today: {
    title: "ضع اتجاهك موضع التنفيذ",
    why: "هذه محطتك اليومية. استخدمها لاختيار بضعة أفعال تدعم خطتك وإنجازها.",
    tip: "ابدأ بفعل واحد تستطيع تسميته بوضوح. حدد وقتاً له إن كان ذلك يساعدك على الانطلاق؛ يمكنك تعديله لاحقاً.",
  },
  reset: {
    title: "تعرّف إلى نقطة بدايتك",
    why: "تمنحك مساحتك للتغيير فرصة لاستكشاف أنماطك قبل وضع خطة. تنقّل بين التأمل، والملاحظة أثناء اليوم، ومراجعة ما يهمك.",
    tip: "ابدأ بسؤال واحد. إجابة صادقة وقصيرة كافية. تخطّ أي شيء لست مستعداً لاستكشافه وعد إليه عندما تشاء.",
  },
  direction: {
    title: "امنح خطواتك التالية هدفاً واضحاً",
    why: "اجمع مستقبلك المنشود، ونتيجة عامك، ومشروع الشهر، وحدودك الشخصية في مكان واحد. خطتك تتطور كلما تعلّمت أكثر.",
    tip: "ابدأ بالحياة التي تريد التوجه إليها، ثم اختر مشروعاً واحداً يمكنك إنهاؤه هذا الشهر. كل حقل أدناه يشرح معناه.",
  },
  journal: {
    title: "استفد من التجربة لتعديل خطتك",
    why: "تربط التأملات بين ما قصدته وما حدث فعلاً. ملاحظاتك وخطواتك الأخيرة تساعدك على تمييز ما يستحق الاحتفاظ به أو تغييره.",
    tip: "جرّب جملة واحدة: ما الذي ساعدك اليوم، وما الذي عرقلك، أو ما تريد تجربته بشكل مختلف غداً. اليوم الفارغ لا يحتاج لتعويض.",
  },
  assistant: {
    title: "احصل على منظور إضافي اختياري",
    why: "يساعدك دليل الذكاء الاصطناعي على تنظيم إجاباتك واقتراح خطوة تالية. أنت وحدك من يقرر ما يناسبك وما يصبح فعلاً ملموساً.",
    tip: "احفظ إجابة أو فعلاً أولاً، ثم اختر السياق الذي تريد مناقشته فقط. قِس الاقتراحات بتجربتك الشخصية. يمكنك استخدام التطبيق بالكامل بلا ذكاء اصطناعي.",
  },
  settings: {
    title: "اجعل هذه المساحة خاصة بك واحتفظ بنسخة",
    why: "تُحفظ مساحة عملك في هذا المتصفح. هنا يمكنك تحديد اسمك، وتنزيل نسخة احتياطية، واستعادة عملك المحفوظ.",
    tip: "نزّل نسخة احتياطية بعد كل جلسة مثمرة وقبل تغيير الأجهزة. استيراد النسخة يستبدل مساحة العمل الحالية؛ وتُحفظ نسخة استرداد أولاً.",
  },
};

export function getJourneyGuide(
  view: View,
  state: State,
  date: string,
  locale: Locale = "en",
) {
  const isAr = locale === "ar";
  const explanations = isAr ? explanationsAr : explanationsEn;
  const answered = prompts.filter(([id]) => state.answers[id]?.trim()).length;
  const planFields = Object.values(state.plan).filter((value) =>
    value.trim(),
  ).length;
  const tasks = state.tasks.filter((task) => !task.archived);
  const day = state.days[date] ?? emptyDay();
  const remaining = tasks.filter(
    (task) => !day.completed.includes(task.id),
  ).length;
  const isNew =
    !answered &&
    !planFields &&
    !state.tasks.length &&
    !state.steps.length &&
    !state.reflections.length;
  let next: { label: string; reason: string; action: GuideAction };
  switch (view) {
    case "today":
      next = isNew
        ? {
            label: isAr ? "ابدأ رحلة التغيير ليوم واحد" : "Begin your one-day reset",
            reason: isAr
              ? "ابدأ باستكشاف ما تريد تغييره. لا تحتاج إلى هدف مكتمل للبدء."
              : "Start by exploring what you would like to change. You do not need a finished goal.",
            action: "reset",
          }
        : !planFields
          ? {
              label: isAr ? "صغ اتجاهي" : "Shape my direction",
              reason: isAr
                ? "لقد بدأت الاستكشاف. اجمع ما يهمك في خطة قابلة للتعديل."
                : "You have started exploring. Bring what matters to you into an editable plan.",
              action: "draft",
            }
          : !tasks.length
            ? {
                label: isAr ? "اختر فعلاً يومياً" : "Choose a daily action",
                reason: isAr
                  ? "بدأت خطتك تتشكل. اختر فعلاً واحداً صغيراً يدعمها."
                  : "Your plan is taking shape. Pick one small action that supports it.",
                action: "task",
              }
            : remaining
              ? {
                  label: isAr ? "اطّلع على خطوات اليوم" : "See today’s actions",
                  reason: isAr
                    ? `${remaining} ${remaining === 1 ? "خطوة ما زالت متبقية" : "خطوات ما زالت متبقية"} اليوم. اختر الخطوة التي تود البدء بها.`
                    : `${remaining} ${remaining === 1 ? "action is" : "actions are"} still open today. Choose the one you want to begin with.`,
                  action: "tasks",
                }
              : {
                  label: isAr ? "تأمّل في أحداث اليوم" : "Reflect on today",
                  reason: isAr
                    ? "لقد أتممت خطواتك الحالية. لاحظ ما ساعدك قبل أن تقرر ما يأتي بعد ذلك."
                    : "You have checked off your current actions. Notice what helped before deciding what comes next.",
                  action: "checkin",
                };
      break;
    case "reset":
      next =
        answered === prompts.length
          ? {
              label: isAr ? "راجع اتجاهي" : "Review my direction",
              reason: isAr
                ? "تم حفظ إجاباتك. راجع مسودة الخطة المصاغة بكلماتك الخاصة."
                : "Your answers are saved. Review a plan draft using your own words.",
              action: "draft",
            }
          : {
              label: isAr ? "انتقل إلى أسئلة التأمل" : "Go to reflection questions",
              reason: answered
                ? isAr
                  ? `تم حفظ ${answered} من ${prompts.length} إجابة. تابع متى شئت؛ كل سؤال اختياري.`
                  : `${answered} of ${prompts.length} answers saved. Continue where you wish; every question is optional.`
                : isAr
                  ? "ابدأ بأسئلة الصباح أدناه. أسماء المراحل تقترح ترتيباً مريحاً، وليست موعداً ملزماً."
                  : "Start with the morning questions below. The phase names suggest an order, not a deadline.",
              action: "questions",
            };
      break;
    case "direction":
      next =
        !state.plan.vision.trim() || !state.plan.month.trim()
          ? {
              label: isAr ? "صغ خطتي" : "Shape my plan",
              reason: isAr
                ? "امنح اتجاهك نقطة انطلاق بسيطة: مستقبلاً منشوداً ومشروعاً لهذا الشهر."
                : "Give your direction a simple starting point: a desired future and one monthly project.",
              action: "plan",
            }
          : !state.steps.length
            ? {
                label: isAr ? "قسّم مشروعي إلى خطوات" : "Break down my project",
                reason: isAr
                  ? "أضف خطوة عملية واحدة لمشروعك أدناه. خطوات المشروع مستقلة عن الأفعال اليومية المتكررة."
                  : "Add one concrete project step below. Project steps are separate from recurring daily actions.",
                action: "project",
              }
            : {
                label: isAr ? "اختر فعلاً يومياً" : "Choose a daily action",
                reason: isAr
                  ? "اختر فعلاً صغيراً تستطيع تكراره دعماً لاتجاهك."
                  : "Choose a small action you can repeat in support of your direction.",
                action: "task",
              };
      break;
    case "journal":
      next = {
        label: isAr ? "دوّن شيئاً لاحظته" : "Capture one thing I noticed",
        reason: state.reflections.length
          ? isAr
            ? "ألقِ نظرة على ملاحظة سابقة، ثم سجّل ما تود الحفاظ عليه أو تعديله."
            : "Look back at an earlier note, then record what you would keep or adjust."
          : isAr
            ? "ملاحظتك الأولى يمكن أن تكون جملة واحدة. لا تحتاج لتلخيص يومك بأكمله."
            : "Your first note can be one sentence. You do not need to summarize your whole day.",
        action: "checkin",
      };
      break;
    case "assistant":
      next = {
        label: isAr ? "استكشف دليل الذكاء الاصطناعي الاختياري" : "Explore the optional AI guide",
        reason: isAr
          ? "اربط مزودك أدناه إن رغبت في المساعدة، ثم راجع ما تشاركه قبل طلب التحليل."
          : "Connect your provider below if you want assistance, then review what you are sharing before requesting analysis.",
        action: "assistant",
      };
      break;
    case "settings":
      next = {
        label: isAr ? "تنزيل نسخة احتياطية" : "Download my backup",
        reason: isAr
          ? "احتفظ بنسخة محمولة من العمل الذي حفظته حتى الآن."
          : "Keep a portable copy of the work you have saved so far.",
        action: "backup",
      };
  }
  return {
    ...explanations[view],
    next,
    isNew,
    statuses: isAr
      ? [
          `${answered} ${answered === 1 ? "إجابة محفوظة" : "إجابات محفوظة"}`,
          `${planFields} من 6 حقول مكتملة`,
          `${tasks.length} ${tasks.length === 1 ? "خطوة يومية" : "خطوات يومية"}`,
          `${state.reflections.length} ${state.reflections.length === 1 ? "ملاحظة محفوظة" : "ملاحظات محفوظة"}`,
        ]
      : [
          `${answered} ${answered === 1 ? "answer" : "answers"} saved`,
          `${planFields} of 6 fields filled`,
          `${tasks.length} daily ${tasks.length === 1 ? "action" : "actions"}`,
          `${state.reflections.length} ${state.reflections.length === 1 ? "note" : "notes"} saved`,
        ],
  };
}
