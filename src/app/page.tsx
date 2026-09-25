"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Circle,
  Compass,
  Sun,
  Leaf,
  Plus,
  Settings,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Download,
  Pencil,
  Coffee,
  CalendarDays,
  Sprout,
  Bot,
  X,
  Moon,
} from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { AiAssistant } from "@/components/AiAssistant";
import { JourneyGuide } from "@/components/JourneyGuide";
import { BaselineAssessmentModal } from "@/components/BaselineAssessmentModal";
import { planGuidance, type GuideAction, type View } from "@/lib/journey";
import {
  TaskForm,
  ResetJourney,
  SettingsView,
  type Modal,
} from "@/components/WorkspaceForms";
import { useLifeOS, update, restore, download } from "@/lib/store";
import {
  emptyDay,
  freshState,
  localDate,
  progress,
  prompts,
  toggleTask,
  type Plan,
} from "@/lib/domain";
import { synthesizePlanFromAnswers } from "@/lib/questionnaire";
import { LanguageProvider, useLanguage } from "@/lib/language";
import {
  summarizePlanDraft,
  type PlanFieldStatus,
} from "@/lib/plan-draft";

const navigation = [
  { id: "today", icon: Sun },
  { id: "reset", icon: Compass },
  { id: "direction", icon: Sprout },
  { id: "journal", icon: BookOpen },
  { id: "assistant", icon: Bot },
] as const;

export default function Home() {
  return <LanguageProvider><LifeOSApp /></LanguageProvider>;
}

function LifeOSApp() {
  const { locale, setLocale, tr, dateLocale } = useLanguage();
  const navigationLabels: Record<View, string> = {
    today: tr("Today", "اليوم"),
    reset: tr("Your reset", "مساحتك للتغيير"),
    direction: tr("My direction", "اتجاهي"),
    journal: tr("Reflections", "تأملات"),
    assistant: tr("AI guide", "دليل الذكاء الاصطناعي"),
    settings: tr("Settings & data", "الإعدادات والبيانات"),
  };
  const planLabels: Record<keyof Plan, string> = {
    vision: tr("The life I’m moving toward", "الحياة التي أتجه إليها"),
    antiVision: tr("What I want to leave behind", "ما أريد تركه خلفي"),
    identity: tr("The person I’m practicing becoming", "الشخص الذي أتدرّب على أن أكونه"),
    year: tr("One meaningful outcome this year", "نتيجة ذات معنى هذا العام"),
    month: tr("My project for this month", "مشروعي لهذا الشهر"),
    constraints: tr("What I will protect (one per line)", "ما سأحافظ عليه (واحد في كل سطر)"),
  };
  const planGuidanceArabic: Record<keyof Plan, string> = {
    vision: "الرؤية هي الحياة اليومية التي تريد التوجه إليها. صف ما قد يتضمنه يوم جيد.",
    antiVision: "الرؤية المضادة هي المستقبل الذي تود تجنبه. سمِّ نمطاً تريد تغييره من دون الحكم على نفسك.",
    identity: "اختر صفة تريد ممارستها من خلال أفعالك. يمكنك تجربتها وتغيير رأيك.",
    year: "اختر نتيجة واحدة تستطيع تمييزها بعد عام. يمكن أن تكون مؤقتة.",
    month: "اختر مشروعاً قابلاً للإنهاء يدعم تلك النتيجة. أضف خطواته العملية أسفل خطتك.",
    constraints: "هذه الحدود هي ما ستحافظ عليه أثناء إحراز التقدم، مثل الراحة أو الوقت مع الآخرين.",
  };
  const snapshot = useLifeOS();
  const [view, setView] = useState<View>("today");
  const [modal, setModal] = useState<Modal>(null);
  const [planEdit, setPlanEdit] = useState<Plan | null>(null);
  const [notice, setNotice] = useState("");
  const previousView = useRef(view);
  useEffect(() => {
    if (previousView.current !== view) {
      previousView.current = view;
      document.getElementById("main")?.focus();
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [view]);
  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("lifeos_theme", next ? "dark" : "light");
  };
  if (!snapshot)
    return (
      <main className="loading">
        <Leaf size={32} />
        <p>{tr("Making room for a better day…", "نهيّئ مساحة ليوم أفضل…")}</p>
      </main>
    );
  const { state, date, error, blocked } = snapshot;
  const day = state.days[date] ?? emptyDay();
  const stats = progress(state, date);
  const tasks = state.tasks.filter((t) => !t.archived);
  const completed = tasks.filter((t) => day.completed.includes(t.id)).length;
  const answered = prompts.filter(([id]) => state.answers[id]?.trim()).length;
  const close = () => {
    setModal(null);
    setPlanEdit(null);
  };
  const openPlanModal = (draft?: Plan) => {
    setPlanEdit({ ...(draft ?? state.plan) });
    setModal(draft ? { type: "plan", draft } : { type: "plan" });
  };
  const openDraft = () =>
    openPlanModal(
      synthesizePlanFromAnswers(
        state.answers,
        state.plan,
        state.assessmentProfile,
      ),
    );
  const guideAction = (action: GuideAction) => {
    const focus = (id: string) => {
      const target = document.getElementById(id);
      target?.focus();
      target?.scrollIntoView({ block: "start", behavior: "instant" });
    };
    switch (action) {
      case "reset":
        setView("reset");
        break;
      case "draft":
        openDraft();
        break;
      case "plan":
        openPlanModal();
        break;
      case "task":
        setModal({ type: "task" });
        break;
      case "checkin":
        setModal({ type: "checkin" });
        break;
      case "tasks":
        focus("daily-actions");
        break;
      case "questions":
        focus("reset-work");
        break;
      case "project":
        focus("project-step");
        break;
      case "assistant":
        focus("ai-workspace");
        break;
      case "backup":
        download(JSON.stringify(state, null, 2), `lifeos-${date}.json`);
        break;
    }
  };
  const guide = blocked ? null : (
    <JourneyGuide
      key={view}
      view={view}
      state={state}
      date={date}
      onNavigate={setView}
      onAction={guideAction}
    />
  );
  const saved = (ok: boolean, message = tr("Saved. One small step forward.", "تم الحفظ. خطوة صغيرة إلى الأمام.")) => {
    if (ok) {
      setNotice(message);
      close();
    }
  };
  const greeting =
    new Date().getHours() < 12
      ? tr("Good morning", "صباح الخير")
      : new Date().getHours() < 18
        ? tr("Good afternoon", "مساء الخير")
        : tr("Good evening", "مساء الخير");
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        {tr("Skip to content", "انتقل إلى المحتوى")}
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("today");
          }}
        >
          <span className="brand-icon">
            <Leaf size={23} />
          </span>
          life<span className="brand-light">os</span>
          <span className="brand-dot">·</span>
        </a>
        <div className="workspace-label">{tr("A LITTLE MORE INTENTIONAL", "بمزيد من القصد")}</div>
        <nav aria-label={tr("Main navigation", "التنقل الرئيسي")}>
          {navigation.map(({ id, icon: Icon }) => (
            <button
              key={id}
              aria-current={view === id ? "page" : undefined}
              className={view === id ? "nav-item active" : "nav-item"}
              onClick={() => setView(id)}
            >
              <Icon size={19} />
              <span>{navigationLabels[id]}</span>
              {id === "reset" && answered < prompts.length && (
                <span className="nav-badge">
                  {answered ? `${answered}/${prompts.length}` : tr("Start", "ابدأ")}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="tiny-label">{tr("YOUR OWN PACE", "وفق إيقاعك الخاص")}</span>
            <p>
              {tr("Small steps.", "خطوات صغيرة.")}
              <br />{tr("A life that feels like yours.", "وحياة تشبهك.")}
            </p>
            <div className="little-sprout">
              <Sprout size={32} />
            </div>
          </div>
          <button
            className={view === "settings" ? "nav-item active" : "nav-item"}
            onClick={() => setView("settings")}
          >
            <Settings size={18} />
            {navigationLabels.settings}
          </button>
          <div className="profile">
            <span className="avatar">
              {state.name.trim().slice(0, 1).toUpperCase() || "Y"}
            </span>
            <div>
              <strong>{state.name || tr("Your space", "مساحتك")}</strong>
              <small>{tr("Saved on this device", "محفوظ على هذا الجهاز")}</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <span className="breadcrumb">{tr("Your space", "مساحتك")}</span>
            <span className="crumb-divider">/</span>
            <strong>
              {navigationLabels[view]}
            </strong>
          </div>
          <span className="date">
            <CalendarDays size={15} />
            {new Date(`${date}T12:00:00`).toLocaleDateString(dateLocale, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={tr("Toggle color theme", "تبديل سمة الألوان")}
            title={tr("Toggle color theme", "تبديل سمة الألوان")}
          >
            <Sun className="theme-icon-light" size={16} />
            <Moon className="theme-icon-dark" size={16} />
            <span>{tr("Theme", "السمة")}</span>
          </button>
          <button
            className="language-toggle"
            type="button"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            aria-label={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
            title={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
          >
            {locale === "en" ? "العربية" : "English"}
          </button>
        </header>
        <main id="main" tabIndex={-1}>
          {(error || blocked) && (
            <div role="alert" className="alert">
              {error}{" "}
              <button onClick={() => setView("settings")}>
                {tr("Open data settings", "فتح إعدادات البيانات")} <ArrowRight size={14} />
              </button>
            </div>
          )}
          {notice && (
            <div className="toast" role="status">
              <Check size={17} />
              {notice}
              <button
                className="icon-button"
                onClick={() => setNotice("")}
                aria-label={tr("Dismiss message", "إغلاق الرسالة")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {view !== "today" && guide}
          {view === "today" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">{tr("MAKE SPACE FOR WHAT MATTERS", "أفسح مساحة لما يهم")}</span>
                  <h1>
                    {greeting}
                    {state.name ? `, ${state.name}` : ""}
                    <span className="heading-dot">.</span>
                  </h1>
                  <p>
                    {tr("You don’t need to change everything. Just choose your next step.", "لا تحتاج إلى تغيير كل شيء. اختر فقط خطوتك التالية.")}
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => setModal({ type: "checkin" })}
                >
                  <Coffee size={17} />
                  {tr("Take a mindful pause", "خذ استراحة واعية")}
                </button>
              </div>
              {guide}
              <div className="stat-strip">
                <div>
                  <span className="stat-icon">
                    <Check size={19} />
                  </span>
                  <div>
                    <strong>
                      {completed}
                      <em> / {tasks.length}</em>
                    </strong>
                    <small>{tr("Priorities completed", "الأولويات المُنجزة")}</small>
                  </div>
                </div>
                <div>
                  <span className="stat-icon peach">
                    <Leaf size={19} />
                  </span>
                  <div>
                    <strong>
                      {stats.streak}
                      <em> {stats.streak === 1 ? tr("day", "يوم") : tr("days", "أيام")}</em>
                    </strong>
                    <small>{tr("Showing up for yourself", "المواظبة لأجل نفسك")}</small>
                  </div>
                </div>
                <div>
                  <span className="stat-icon lavender">
                    <Compass size={19} />
                  </span>
                  <div>
                    <strong>
                      {answered}
                      <em> / {prompts.length}</em>
                    </strong>
                    <small>{tr("Reflections explored", "التأملات المُستكشفة")}</small>
                  </div>
                </div>
              </div>
              <div className="dashboard-grid">
                <section
                  className="card priorities"
                  id="daily-actions"
                  tabIndex={-1}
                >
                  <div className="section-heading">
                    <div>
                      <h2>{tr("Today’s small steps", "خطوات اليوم الصغيرة")}</h2>
                      <p>{tr("Focus on a few things that move you forward.", "ركّز على بضعة أمور تدفعك إلى الأمام.")}</p>
                    </div>
                    <span className="count-label">
                      {completed}/{tasks.length}
                    </span>
                  </div>
                  <div className="progress-track">
                    <span
                      style={{
                        width: `${tasks.length ? (completed / tasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  {!tasks.length && (
                    <div className="empty-state">
                      <span className="empty-icon">
                        <Sun size={27} />
                      </span>
                      <h3>{tr("What would make today feel worthwhile?", "ما الذي سيجعل يومك ذا قيمة؟")}</h3>
                      <p>
                        {tr("Start with one manageable action. Two or three is plenty.", "ابدأ بفعل واحد يمكن إنجازه. خطوتان أو ثلاث كافية.")}
                      </p>
                    </div>
                  )}
                  <div className="task-list">
                    {tasks.map((task, index) => (
                      <div
                        className={`task-row ${day.completed.includes(task.id) ? "done" : ""}`}
                        key={task.id}
                      >
                        <button
                          aria-label={`${day.completed.includes(task.id) ? tr("Undo", "تراجع") : tr("Complete", "إكمال")} ${task.title}`}
                          aria-pressed={day.completed.includes(task.id)}
                          className="task-toggle"
                          onClick={() => update((s) => toggleTask(s, task.id))}
                        >
                          {day.completed.includes(task.id) ? (
                            <Check size={17} />
                          ) : (
                            <Circle size={21} />
                          )}
                        </button>
                        <div className="task-content">
                          <span className="tiny-label">
                            {index === 0 ? tr("YOUR MAIN FOCUS", "تركيزك الرئيسي") : tr("A SMALL STEP", "خطوة صغيرة")}
                            {task.time ? ` · ${task.time}` : ""}
                          </span>
                          <strong>{task.title}</strong>
                        </div>
                        <button
                          className="icon-button"
                          aria-label={`${tr("Edit", "تعديل")} ${task.title}`}
                          onClick={() => setModal({ type: "task", task })}
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="add-button"
                    onClick={() => setModal({ type: "task" })}
                  >
                    <Plus size={17} />
                    {tr("Add a small step", "أضف خطوة صغيرة")}
                  </button>
                  {completed > 0 && completed === tasks.length && (
                    <p className="success-line">
                      <Check size={16} />
                      {tr("You made room for what matters today. Enjoy some rest.", "أفسحت مساحة لما يهم اليوم. استمتع ببعض الراحة.")}
                    </p>
                  )}
                </section>
                <section className="card direction-card">
                  <span className="eyebrow">{tr("YOUR NORTH STAR", "بوصلتك")}</span>
                  <span className="north-star" aria-hidden="true">
                    ✳
                  </span>
                  <h2>
                    {tr("A little reminder", "تذكير بسيط")}
                    <br /> {tr("of your why.", "بسبب انطلاقتك.")}
                  </h2>
                  <p>
                    {state.plan.identity ||
                      tr("You get to decide what a meaningful life looks like for you.", "أنت من يقرر كيف تبدو الحياة ذات المعنى بالنسبة لك.")}
                  </p>
                  <div className="divider" />
                  <span className="tiny-label">{tr("THIS MONTH, I’M WORKING ON", "أعمل هذا الشهر على")}</span>
                  <h3>{state.plan.month || tr("Something that matters to me.", "شيء يهمني.")}</h3>
                  <button
                    className="text-button"
                    onClick={() => setView("direction")}
                  >
                    {tr("See my direction", "اطّلع على اتجاهي")} <ArrowRight size={16} />
                  </button>
                </section>
              </div>
              <div className="dashboard-grid bottom-grid">
                <section className="card">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">{tr("A MOMENT TO NOTICE", "لحظة للملاحظة")}</span>
                      <h2>{tr("How are you arriving today?", "كيف تشعر اليوم؟")}</h2>
                    </div>
                    <Coffee size={21} className="muted" />
                  </div>
                  <div className="moods">
                    {[
                      "Low energy",
                      "A little scattered",
                      "Steady",
                      "Feeling good",
                    ].map((m, i) => (
                      <button
                        className={day.mood === m ? "mood selected" : "mood"}
                        key={m}
                        aria-pressed={day.mood === m}
                        onClick={() =>
                          update((s) => ({
                            ...s,
                            days: {
                              ...s.days,
                              [date]: {
                                ...(s.days[date] ?? emptyDay()),
                                mood: m,
                              },
                            },
                          }))
                        }
                      >
                        <span aria-hidden="true">
                          {["☁", "〰", "◒", "☀"][i]}
                        </span>
                        {({ "Low energy": tr("Low energy", "طاقة منخفضة"), "A little scattered": tr("A little scattered", "شيء من التشتت"), Steady: tr("Steady", "متوازن"), "Feeling good": tr("Feeling good", "أشعر أنني بخير") } as Record<string, string>)[m]}
                      </button>
                    ))}
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setModal({ type: "checkin" })}
                  >
                    {tr("Leave yourself a note", "اترك لنفسك ملاحظة")} <ArrowRight size={15} />
                  </button>
                </section>
                <section className="gentle-note">
                  <span className="note-flower" aria-hidden="true">
                    ✳
                  </span>
                  <div>
                    <span className="tiny-label">{tr("A GENTLE REMINDER", "تذكير لطيف")}</span>
                    <p>
                      {tr("Consistency is coming back.", "المواظبة هي العودة.")}
                      <br />
                      {tr("Even after a difficult day.", "حتى بعد يوم صعب.")}
                    </p>
                    <span>{tr("Your progress is still yours.", "تقدمك ما زال ملكك.")}</span>
                  </div>
                </section>
              </div>
            </>
          )}
          {view === "today" && state.plan.constraints.trim() && (
            <section className="card boundaries">
              <div className="section-heading">
                <div>
                  <h2>{tr("What I’m protecting today", "ما أحافظ عليه اليوم")}</h2>
                  <p>{tr("Success includes keeping space for the things you value.", "النجاح يشمل الحفاظ على مساحة للأشياء التي تقدّرها.")}</p>
                </div>
                <Leaf size={20} />
              </div>
              {Array.from(
                new Set(
                  state.plan.constraints
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                ),
              ).map((rule) => (
                <label className="boundary" key={rule}>
                  <input
                    type="checkbox"
                    checked={day.rules.includes(rule)}
                    onChange={() =>
                      update((s) => {
                        const today = s.days[date] ?? emptyDay();
                        return {
                          ...s,
                          days: {
                            ...s.days,
                            [date]: {
                              ...today,
                              rules: today.rules.includes(rule)
                                ? today.rules.filter((r) => r !== rule)
                                : [...today.rules, rule],
                            },
                          },
                        };
                      })
                    }
                  />
                  <span>{rule}</span>
                </label>
              ))}
            </section>
          )}
          {view === "reset" && (
            <ResetJourney
              state={state}
              onDraft={openDraft}
              onCheckIn={(prompt) => setModal({ type: "checkin", prompt })}
              onNotice={setNotice}
              onDirection={() => setView("direction")}
              onOpenAssessment={() => setModal({ type: "assessment" })}
            />
          )}
          {view === "direction" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">{tr("A COMPASS, NOT A FINISH LINE", "بوصلة لا خط نهاية")}</span>
                  <h1>
                    {tr("My direction", "اتجاهي")}<span className="heading-dot">.</span>
                  </h1>
                  <p>
                    {tr("A living plan. Adjust it as you learn more about yourself.", "خطة حية. عدّلها كلما تعرّفت إلى نفسك أكثر.")}
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() => openPlanModal()}
                >
                  <Pencil size={16} />
                  {tr("Edit my plan", "تعديل خطتي")}
                </button>
              </div>
              <div className="plan-grid">
                {(Object.keys(planLabels) as (keyof Plan)[]).map((key, i) => (
                  <section
                    className={`card plan-card ${i === 0 ? "vision-plan" : ""}`}
                    key={key}
                  >
                    <span className="eyebrow">
                      0{i + 1} / {planLabels[key]}
                    </span>
                    <small className="plan-hint">{locale === "ar" ? planGuidanceArabic[key] : planGuidance[key]}</small>
                    <p>
                      {state.plan[key] ||
                        tr("Still taking shape. Make room to explore this in your reset.", "ما زال يتشكل. خصص مساحة لاستكشافه في رحلتك للتغيير.")}
                    </p>
                  </section>
                ))}
              </div>
              <section className="card project-card">
                <div className="section-heading">
                  <div>
                    <h2>{tr("This month, one step at a time", "هذا الشهر، خطوة في كل مرة")}</h2>
                    <p>
                      {state.plan.month ||
                        tr("Choose a small project in your plan, then break it down here.", "اختر مشروعاً صغيراً من خطتك ثم قسّمه هنا.")}
                    </p>
                  </div>
                  <strong className="project-percent">{stats.project}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${stats.project}%` }} />
                </div>
                {state.steps.map((step) => (
                  <div className="task-row" key={step.id}>
                    <button
                      className="task-toggle"
                      aria-label={`${step.done ? tr("Undo", "تراجع") : tr("Complete", "إكمال")} ${step.title}`}
                      aria-pressed={step.done}
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          steps: s.steps.map((t) =>
                            t.id === step.id ? { ...t, done: !t.done } : t,
                          ),
                        }))
                      }
                    >
                      {step.done ? <Check size={19} /> : <Circle size={21} />}
                    </button>
                    <span
                      className={
                        step.done ? "struck task-content" : "task-content"
                      }
                    >
                      {step.title}
                    </span>
                    <button
                      className="icon-button"
                      aria-label={`${tr("Remove", "إزالة")} ${step.title}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            tr("Remove this project step? Its progress points will also be removed.", "هل تريد إزالة خطوة المشروع هذه؟ ستُزال نقاط تقدمها أيضاً."),
                          )
                        )
                          update((s) => ({
                            ...s,
                            steps: s.steps.filter((t) => t.id !== step.id),
                          }));
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <form
                  className="inline-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const title = String(
                      new FormData(form).get("step") || "",
                    ).trim();
                    if (
                      title &&
                      update((s) => ({
                        ...s,
                        steps: [
                          ...s.steps,
                          { id: crypto.randomUUID(), title, done: false },
                        ],
                      }))
                    )
                      form.reset();
                  }}
                >
                  <label className="sr-only" htmlFor="project-step">
                    {tr("New project step", "خطوة مشروع جديدة")}
                  </label>
                  <input
                    id="project-step"
                    name="step"
                    required
                    maxLength={240}
                    placeholder={tr("One concrete step toward this project…", "خطوة عملية واحدة نحو هذا المشروع…")}
                  />
                  <button className="button secondary">
                    <Plus size={16} />
                    {tr("Add step", "أضف خطوة")}
                  </button>
                </form>
              </section>
            </>
          )}
          {view === "journal" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">{tr("NOTICE. LEARN. BEGIN AGAIN.", "لاحظ. تعلّم. ابدأ من جديد.")}</span>
                  <h1>
                    {tr("Room to reflect", "مساحة للتأمل")}<span className="heading-dot">.</span>
                  </h1>
                  <p>
                    {tr("Your progress includes the things you notice along the way.", "يشمل تقدمك الأشياء التي تلاحظها في الطريق.")}
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() => setModal({ type: "checkin" })}
                >
                  <Plus size={17} />
                  {tr("New reflection", "تأمل جديد")}
                </button>
              </div>
              <section className="card week-card">
                <div className="section-heading">
                  <div>
                    <h2>{tr("Your last seven days", "أيامك السبعة الماضية")}</h2>
                    <p>
                      {tr("Every completed step counts. Empty days are room to begin again.", "كل خطوة مكتملة مهمة. الأيام الفارغة مساحة للبدء من جديد.")}
                    </p>
                  </div>
                  <ChartNoAxesColumnIncreasing size={23} />
                </div>
                <div className="week-chart">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(`${date}T12:00:00`);
                    d.setDate(d.getDate() - 6 + i);
                    const count =
                      state.days[localDate(d)]?.completed.length || 0;
                    return (
                      <div key={i}>
                        <span className="bar-count">{count}</span>
                        <div className="bar-space">
                          <span
                            style={{
                              height: `${Math.min(100, count * 25)}%`,
                              minHeight: 4,
                            }}
                          />
                        </div>
                        <small>
                          {d.toLocaleDateString(dateLocale, {
                            weekday: "short",
                          })}
                        </small>
                      </div>
                    );
                  })}
                </div>
                <p className="chart-caption">
                  {stats.total} {tr("progress points", "نقطة تقدم")} · {tr("Level", "المستوى")} {stats.level} ·{" "}
                  {stats.xp}/{stats.next} {tr("to your next level", "للوصول إلى مستواك التالي")}
                </p>
              </section>
              {!state.reflections.length && (
                <section className="card empty-state">
                  <BookOpen size={30} />
                  <h2>{tr("Nothing to catch up on.", "لا شيء يلزم تعويضه.")}</h2>
                  <p>{tr("Start with one thing you noticed today.", "ابدأ بشيء واحد لاحظته اليوم.")}</p>
                </section>
              )}
              <div className="journal-list">
                {state.reflections
                  .slice()
                  .reverse()
                  .map((r) => (
                    <article className="card" key={r.id}>
                      <div className="section-heading">
                        <span className="tiny-label">
                          {new Date(r.timestamp).toLocaleString(dateLocale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        <span className="tag">{r.mood ? ({ "Low energy": tr("Low energy", "طاقة منخفضة"), "A little scattered": tr("A little scattered", "شيء من التشتت"), Steady: tr("Steady", "متوازن"), "Feeling good": tr("Feeling good", "أشعر أنني بخير") } as Record<string, string>)[r.mood] || r.mood : tr("Reflection", "تأمل")}</span>
                      </div>
                      <p className="preserve-lines">{r.note}</p>
                    </article>
                  ))}
              </div>
            </>
          )}
          {view === "assistant" && (
            <div id="ai-workspace" tabIndex={-1}>
              <AiAssistant state={state} date={date} />
            </div>
          )}
          {view === "settings" && (
            <SettingsView
              key={state.name}
              state={state}
              onModal={setModal}
              onNotice={setNotice}
            />
          )}
          <footer>
            <Leaf size={13} />
            <span>{tr("A little more intention, every day.", "مزيد من القصد، كل يوم.")}</span>
            <a
              href="https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1"
              target="_blank"
              rel="noreferrer"
            >
              {tr("Inspired by Dan Koe", "مستوحى من دان كو")} <ArrowUpRight size={12} />
            </a>
          </footer>
        </main>
      </div>
      {modal?.type === "task" && (
        <Dialog
          title={modal.task ? tr("Make this step your own", "اجعل هذه الخطوة بطريقتك") : tr("One small step", "خطوة صغيرة واحدة")}
          onClose={close}
        >
          <TaskForm task={modal.task} onSave={saved} />
        </Dialog>
      )}
      {modal?.type === "checkin" && (
        <Dialog title={tr("A moment to come back to yourself", "لحظة للعودة إلى نفسك")} onClose={close}>
          <p>
            {modal.prompt ||
              tr("What are you noticing? What would help you take your next small step?", "ما الذي تلاحظه؟ ما الذي سيساعدك على اتخاذ خطوتك الصغيرة التالية؟")}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const note = String(data.get("note")).trim();
              if (note)
                saved(
                  update((s) => ({
                    ...s,
                    reflections: [
                      ...s.reflections,
                      {
                        id: crypto.randomUUID(),
                        timestamp: new Date().toISOString(),
                        note,
                        mood: String(data.get("mood")),
                      },
                    ],
                  })),
                  tr("Reflection saved. Thank you for showing up.", "تم حفظ التأمل. شكراً لحضورك.") ,
                );
            }}
          >
            <label htmlFor="reflection-note">{tr("Your reflection", "تأملك")}</label>
            <textarea
              autoFocus
              id="reflection-note"
              name="note"
              required
              maxLength={10000}
              rows={5}
              placeholder={tr("There’s no right answer…", "لا توجد إجابة صحيحة واحدة…")}
            />
            <label htmlFor="reflection-mood">{tr("How does this moment feel?", "كيف تشعر في هذه اللحظة؟")}</label>
            <select
              id="reflection-mood"
              name="mood"
              defaultValue={day.mood || "Steady"}
            >
              {["Low energy", "A little scattered", "Steady", "Feeling good"].map((m) => (
                <option key={m} value={m}>{({ "Low energy": tr("Low energy", "طاقة منخفضة"), "A little scattered": tr("A little scattered", "شيء من التشتت"), Steady: tr("Steady", "متوازن"), "Feeling good": tr("Feeling good", "أشعر أنني بخير") } as Record<string, string>)[m]}</option>
              ))}
            </select>
            <div className="dialog-actions">
              <button
                type="button"
                className="button secondary"
                onClick={close}
              >
                {tr("Come back later", "العودة لاحقاً")}
              </button>
              <button className="button primary">
                {tr("Save reflection", "حفظ التأمل")} <Check size={16} />
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {modal?.type === "plan" && planEdit && (
        <Dialog
          title={
            modal.draft ? tr("Review your direction", "راجع اتجاهك") : tr("Your plan, in your words", "خطتك، بكلماتك")
          }
          onClose={close}
        >
          {modal.draft && (
            <p>
              {tr("This draft uses your own answers. Edit anything before saving. Your daily actions can be added from Today.", "تستخدم هذه المسودة إجاباتك الخاصة. عدّل أي شيء قبل الحفظ. يمكنك إضافة أفعالك اليومية من صفحة اليوم.")}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saved(
                update((s) => ({ ...s, plan: planEdit })),
                tr("Your direction is saved. Keep it flexible.", "تم حفظ اتجاهك. أبقه مرناً.") ,
              );
            }}
          >
            {(Object.keys(planLabels) as (keyof Plan)[]).map((key) => {
              const statuses = modal.draft
                ? summarizePlanDraft(state.plan, modal.draft)
                : null;
              const status = statuses?.[key];
              const statusLabel = (
                {
                  empty: tr("Empty in draft", "فارغ في المسودة"),
                  unchanged: tr("Same as saved", "مطابق للمحفوظ"),
                  updated: tr("Changed from saved", "يختلف عن المحفوظ"),
                  new: tr("New in draft", "جديد في المسودة"),
                } satisfies Record<PlanFieldStatus, string>
              )[status ?? "unchanged"];
              return (
              <div key={key} className="plan-field-block">
                <div className="plan-field-head">
                  <label htmlFor={`plan-${key}`}>{planLabels[key]}</label>
                  {modal.draft && status && status !== "unchanged" && (
                    <span className={`plan-field-status ${status}`}>
                      {statusLabel}
                    </span>
                  )}
                </div>
                <p className="field-hint" id={`plan-${key}-help`}>
                  {locale === "ar" ? planGuidanceArabic[key] : planGuidance[key]}
                </p>
                <textarea
                  id={`plan-${key}`}
                  aria-describedby={`plan-${key}-help`}
                  name={key}
                  value={planEdit[key]}
                  onChange={(e) =>
                    setPlanEdit((p) =>
                      p ? { ...p, [key]: e.target.value } : p,
                    )
                  }
                  rows={2}
                  maxLength={5000}
                />
                {modal.draft &&
                  status === "updated" &&
                  state.plan[key].trim() && (
                    <button
                      type="button"
                      className="text-button plan-revert-field"
                      onClick={() =>
                        setPlanEdit((p) =>
                          p ? { ...p, [key]: state.plan[key] } : p,
                        )
                      }
                    >
                      {tr("Keep saved version", "الإبقاء على النص المحفوظ")}
                    </button>
                  )}
              </div>
            );
            })}
            <div className="dialog-actions">
              <button
                type="button"
                className="button secondary"
                onClick={close}
              >
                {tr("Cancel", "إلغاء")}
              </button>
              <button className="button primary">
                {tr("Save my direction", "حفظ اتجاهي")} <Check size={16} />
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {modal?.type === "reset" && (
        <Dialog title={tr("Start a fresh chapter?", "بدء فصل جديد؟")} onClose={close}>
          <p>
            {tr("This clears your current plan, tasks, and reflections. A local recovery copy is saved first. Download a backup to keep a permanent copy.", "سيؤدي ذلك إلى مسح خطتك ومهامك وتأملاتك الحالية. يُحفظ أولاً نسخة استرداد محلية. نزّل نسخة احتياطية للاحتفاظ بنسخة دائمة.")}
          </p>
          <div className="dialog-actions">
            <button
              className="button secondary"
              onClick={() =>
                download(JSON.stringify(state, null, 2), `lifeos-${date}.json`)
              }
            >
              <Download size={16} />
              {tr("Download backup", "تنزيل نسخة احتياطية")}
            </button>
            <button
              className="button danger"
              onClick={() =>
                saved(restore(freshState()), tr("A fresh chapter is ready.", "الفصل الجديد جاهز."))
              }
            >
              {tr("Save recovery copy & reset", "حفظ نسخة استرداد وإعادة ضبط")}
            </button>
          </div>
        </Dialog>
      )}
      {modal?.type === "import" && (
        <Dialog title={tr("Restore this backup?", "استعادة هذه النسخة الاحتياطية؟")} onClose={close}>
          <p>
            {tr("This backup contains", "تحتوي هذه النسخة الاحتياطية على")} {modal.data.tasks.length} {tr("steps and", "خطوات و")} {modal.data.reflections.length} {tr("reflections. It will replace the current workspace. A recovery copy of your current data is saved first.", "تأملات. وستستبدل مساحة العمل الحالية. تُحفظ أولاً نسخة استرداد لبياناتك الحالية.")}
          </p>
          <div className="dialog-actions">
            <button className="button secondary" onClick={close}>
              {tr("Cancel", "إلغاء")}
            </button>
            <button
              className="button primary"
              onClick={() =>
                saved(restore(modal.data), tr("Backup restored successfully.", "تمت استعادة النسخة الاحتياطية بنجاح."))
              }
            >
              Restore backup
            </button>
          </div>
        </Dialog>
      )}
      {modal?.type === "assessment" && (
        <BaselineAssessmentModal
          currentProfile={state.assessmentProfile}
          onClose={close}
          onComplete={(profile) => {
            setNotice(
              `${tr("Calibrated as", "تمت المعايرة بوصف") } ${profile.archetypeName}. ${tr("Daily MSQ reflections are ready!", "تأملات اليوم جاهزة!")}`,
            );
          }}
        />
      )}
    </div>
  );
}
