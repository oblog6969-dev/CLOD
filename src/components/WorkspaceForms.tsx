"use client";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Sun,
  Moon,
  Coffee,
  CalendarDays,
  Upload,
  Download,
  Archive,
  RotateCcw,
  Sparkles,
  Zap,
  Award,
  Languages,
} from "lucide-react";
import {
  update,
  download,
  exportOriginal,
  exportLegacy,
  recoverBackup,
} from "@/lib/store";
import {
  decode,
  localDate,
  prompts,
  type AssessmentProfile,
  type Plan,
  type State,
  type Task,
} from "@/lib/domain";
import {
  getPromptMsq,
  formatMsqAnswer,
  type MsqOption,
} from "@/lib/questionnaire";
import { useLanguage } from "@/lib/language";
import { workspaceCopy } from "@/lib/locale/workspace";
import { msqMetaFor } from "@/lib/msq-meta";
import { MASLOW_TIER_LABELS } from "@/lib/maslow";
import { getCheckInPrompts } from "@/lib/locale/prompts";
import { buildIcsCalendar } from "@/lib/calendar-export.mjs";
import { displayArchetype } from "@/lib/assessment";
export type Modal =
  | { type: "task"; task?: Task }
  | { type: "checkin"; prompt?: string }
  | { type: "plan"; draft?: Plan }
  | { type: "reset" }
  | { type: "assessment" }
  | { type: "import"; data: State }
  | null;

export function TaskForm({
  task,
  onSave,
}: {
  task?: Task;
  onSave: (ok: boolean, message?: string) => void;
}) {
  const { locale } = useLanguage();
  const copy = workspaceCopy(locale);
  return (
    <form
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const title = String(data.get("title")).trim();
        if (!title) return;
        const next = {
          id: task?.id || crypto.randomUUID(),
          title,
          time: String(data.get("time") || ""),
          archived: false,
        };
        onSave(
          update((s) => ({
            ...s,
            tasks: task
              ? s.tasks.map((t) => (t.id === task.id ? next : t))
              : [...s.tasks, next],
          })),
          copy.stepReady,
        );
      }}
    >
      <p>{copy.taskIntro}</p>
      <label htmlFor="task-title">{copy.taskLabel}</label>
      <input
        id="task-title"
        name="title"
        autoFocus
        required
        maxLength={240}
        defaultValue={task?.title || ""}
        placeholder={copy.taskPlaceholder}
      />
      <label htmlFor="task-time">
        {copy.taskTimeLabel}{" "}
        <span className="muted">{copy.taskTimeOptional}</span>
      </label>
      <input
        type="time"
        id="task-time"
        name="time"
        defaultValue={task?.time || ""}
      />
      <div className="dialog-actions">
        {task && (
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              onSave(
                update((s) => ({
                  ...s,
                  tasks: s.tasks.map((t) =>
                    t.id === task.id ? { ...t, archived: true } : t,
                  ),
                })),
                copy.stepArchived,
              )
            }
          >
            <Archive size={16} />
            {copy.archiveStep}
          </button>
        )}
        <button className="button primary">
          {copy.saveStep} <Check size={16} />
        </button>
      </div>
    </form>
  );
}

export function ResetJourney({
  state,
  onDraft,
  onCheckIn,
  onNotice,
  onDirection,
  onOpenAssessment,
}: {
  state: State;
  onDraft: () => void;
  onCheckIn: (prompt: string) => void;
  onNotice: (s: string) => void;
  onDirection: () => void;
  onOpenAssessment?: () => void;
}) {
  const { locale } = useLanguage();
  const copy = workspaceCopy(locale);
  const checkIns = getCheckInPrompts(locale);
  const [phase, setPhase] = useState<"morning" | "daytime" | "evening">(
    "morning",
  );
  const [index, setIndex] = useState(0);
  const questions = prompts.filter(([id]) =>
    phase === "evening" ? id.startsWith("e") : id.startsWith("m"),
  );
  const question = questions[Math.min(index, questions.length - 1)];
  const phaseGuide = {
    morning: {
      title: copy.phaseMorningTitle,
      explanation: copy.phaseMorningExplain,
      recommendation: copy.phaseMorningRec,
    },
    daytime: {
      title: copy.phaseDayTitle,
      explanation: copy.phaseDayExplain,
      recommendation: copy.phaseDayRec,
    },
    evening: {
      title: copy.phaseEveningTitle,
      explanation: copy.phaseEveningExplain,
      recommendation: copy.phaseEveningRec,
    },
  }[phase];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{copy.resetEyebrow}</span>
          <h1>
            {copy.resetTitle}
            <span className="heading-dot">.</span>
          </h1>
          <p>{copy.resetLead}</p>
        </div>
        <span className="tag">
          <Check size={14} />
          {copy.resetTag}
        </span>
      </div>
      <div className="phase-nav" role="tablist" aria-label={copy.ariaResetPhases}>
        {(
          [
            {
              id: "morning",
              title: copy.phaseMorning,
              subtitle: copy.phaseMorningSub,
              icon: Sun,
            },
            {
              id: "daytime",
              title: copy.phaseDay,
              subtitle: copy.phaseDaySub,
              icon: Coffee,
            },
            {
              id: "evening",
              title: copy.phaseEvening,
              subtitle: copy.phaseEveningSub,
              icon: Moon,
            },
          ] as const
        ).map(({ id, title, subtitle, icon: Icon }, i) => (
          <button
            key={id}
            role="tab"
            aria-selected={phase === id}
            onClick={() => {
              setPhase(id);
              setIndex(0);
            }}
            className={phase === id ? "phase active" : "phase"}
          >
            <span className="phase-icon">
              <Icon size={20} />
            </span>
            <span>
              <strong>
                {i + 1}. {title}
              </strong>
              <small>{subtitle}</small>
            </span>
          </button>
        ))}
      </div>
      <section
        className="phase-guidance"
        id="reset-work"
        tabIndex={-1}
        aria-label={copy.ariaPhaseGuidance}
      >
        <h2>{phaseGuide.title}</h2>
        <p>{phaseGuide.explanation}</p>
        <p>
          <strong>{copy.tryThis}</strong> {phaseGuide.recommendation}
        </p>
      </section>
      {phase !== "daytime" ? (
        <>
          {state.assessmentProfile ? (
            <div className="assessment-active-banner">
              <div className="banner-left">
                <Sparkles size={16} />
                <span>
                  {copy.attunedTo}{" "}
                  <strong>
                    {
                      displayArchetype(state.assessmentProfile, locale).name
                    }
                  </strong>{" "}
                  • {copy.msqActive}
                </span>
              </div>
              {onOpenAssessment && (
                <button
                  type="button"
                  className="text-button"
                  onClick={onOpenAssessment}
                >
                  {copy.recalibrate}
                </button>
              )}
            </div>
          ) : (
            <div className="assessment-invite-banner">
              <div className="banner-left">
                <Zap size={16} />
                <span>
                  <strong>{copy.tiredTyping}</strong> {copy.assessmentInvite}
                </span>
              </div>
              {onOpenAssessment && (
                <button
                  type="button"
                  className="button secondary sm"
                  onClick={onOpenAssessment}
                >
                  {copy.takeAssessment} <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
          <section className="card question-card">
            <div className="section-heading">
              <span className="eyebrow">
                {phase === "evening" ? copy.phaseEvening : copy.phaseMorning} / {copy.questionOf(index + 1, questions.length)}
              </span>
              <span className="tag">
                {questions.filter(([id]) => state.answers[id]?.trim()).length}{" "}
                {copy.explored}
              </span>
            </div>
            <div className="question-dots">
              {questions.map(([id], i) => (
                <button
                  key={id}
                  aria-label={`Question ${i + 1}${state.answers[id] ? ", answered" : ""}`}
                  aria-current={index === i ? "step" : undefined}
                  className={`${state.answers[id]?.trim() ? "filled" : ""} ${index === i ? "current" : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <AnswerForm
              key={question[0]}
              question={question}
              answer={state.answers[question[0]] || ""}
              selectedOptionIds={state.selectedOptions?.[question[0]] || []}
              profile={state.assessmentProfile}
              plan={state.plan}
              onSave={(value, optionIds) => {
                if (
                  update((s) => ({
                    ...s,
                    answers: { ...s.answers, [question[0]]: value },
                    selectedOptions: {
                      ...(s.selectedOptions || {}),
                      [question[0]]: optionIds,
                    },
                  }))
                ) {
                  onNotice(copy.answerSaved);
                  if (index < questions.length - 1) setIndex(index + 1);
                  else if (phase === "morning") {
                    setPhase("daytime");
                    setIndex(0);
                  } else onDraft();
                }
              }}
            />
          <div className="question-navigation">
            <button
              className="text-button"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              <ArrowLeft size={16} className="rtl-flip" />
              {copy.previous}
            </button>
            <button
              className="text-button"
              onClick={() => {
                if (index < questions.length - 1) setIndex(index + 1);
                else if (phase === "morning") {
                  setPhase("daytime");
                  setIndex(0);
                } else onDraft();
              }}
            >
              {copy.skipForNow} <ArrowRight size={16} className="rtl-flip" />
            </button>
          </div>
          <p className="privacy-note">{copy.privacyReset}</p>
          <p className="privacy-note">{copy.msqEducationalNote}</p>
        </section>
      </>
    ) : (
        <>
          <section className="card">
            <div className="section-heading">
              <div>
                <h2>{copy.dayPauseTitle}</h2>
                <p>{copy.dayPauseLead}</p>
              </div>
            </div>
            <label htmlFor="reset-date">{copy.reflectionDayLabel}</label>
            <input
              id="reset-date"
              type="date"
              value={state.resetDate}
              onChange={(e) => {
                if (e.target.value)
                  update((s) => ({ ...s, resetDate: e.target.value }));
              }}
            />
            <div className="reminder-list">
              {checkIns.map((prompt, i) => (
                <div className="reminder-row" key={prompt}>
                  <label className="sr-only" htmlFor={`reminder-${i}`}>
                    Time for reflection {i + 1}
                  </label>
                  <input
                    id={`reminder-${i}`}
                    type="time"
                    aria-label={copy.ariaReflectionTime(i + 1)}
                    value={state.reminderTimes[i]}
                    onChange={(e) => {
                      if (e.target.value)
                        update((s) => ({
                          ...s,
                          reminderTimes: s.reminderTimes.map((t, j) =>
                            i === j ? e.target.value : t,
                          ),
                        }));
                    }}
                  />
                  <p>{prompt}</p>
                  <button
                    className="icon-button"
                    aria-label={copy.ariaReflectOn(prompt)}
                    onClick={() => onCheckIn(prompt)}
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="dialog-actions">
              <button
                className="button secondary"
                onClick={() => {
                  exportCalendar(state, checkIns, locale);
                  onNotice(copy.calendarExported);
                }}
              >
                <CalendarDays size={17} />
                {copy.exportReminders}
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setPhase("evening");
                  setIndex(0);
                }}
              >
                {copy.enterEvening} <ArrowRight size={17} className="rtl-flip" />
              </button>
            </div>
          </section>
        </>
      )}
      <div className="journey-handoff">
        <div>
          <strong>{copy.handoffTitle}</strong>
          <p>{copy.handoffLead}</p>
        </div>
        <button
          type="button"
          className="button secondary"
          aria-label={copy.continuePlan}
          onClick={onDirection}
        >
          {copy.continuePlan} <ArrowRight size={16} className="rtl-flip" />
        </button>
      </div>
      <p className="source-note">
        {locale === "ar" ? (
          copy.sourceAdaptation
        ) : (
          <>
            An original guided adaptation of{" "}
            <a
              href="https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1"
              target="_blank"
              rel="noreferrer"
            >
              Dan Koe’s one-day protocol
            </a>
            . A tool for reflection, not a promise to transform everything
            overnight.
          </>
        )}
      </p>
    </>
  );
}
function AnswerForm({
  question,
  answer,
  selectedOptionIds = [],
  profile,
  plan,
  onSave,
}: {
  question: readonly [string, string, string];
  answer: string;
  selectedOptionIds?: string[];
  profile?: AssessmentProfile | null;
  plan?: Plan;
  onSave: (v: string, optionIds: string[]) => void;
}) {
  const { locale } = useLanguage();
  const copy = workspaceCopy(locale);
  const msqDef = getPromptMsq(question[0], profile, locale);
  const meta = msqMetaFor(question[0]);
  const [selected, setSelected] = useState<string[]>(selectedOptionIds);
  const [customText, setCustomText] = useState(() => {
    if (selectedOptionIds.length === 0) return answer || "";
    if (msqDef) {
      const match = answer.match(/Note:\s*([\s\S]*)$/);
      if (match) return match[1].trim();
      const optionLabels = msqDef.options
        .filter((o) => selectedOptionIds.includes(o.id))
        .map((o) => o.label)
        .join("; ");
      if (answer !== optionLabels) return answer || "";
    }
    return "";
  });
  const [aiOptions, setAiOptions] = useState<MsqOption[] | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState("");

  const activeOptions = aiOptions || msqDef?.options || [];

  const handleToggle = (optId: string) => {
    let next: string[];
    if (msqDef?.multiSelect) {
      next = selected.includes(optId)
        ? selected.filter((id) => id !== optId)
        : [...selected, optId];
    } else {
      next = selected.includes(optId) ? [] : [optId];
    }
    setSelected(next);
  };

  const handleGenerateAi = async () => {
    setGeneratingAi(true);
    setAiNotice("");
    try {
      const res = await fetch("/api/ai/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: question[0],
          profile,
          plan,
        }),
      });
      if (!res.ok) throw new Error("Could not generate AI options");
      const data = await res.json();
      if (Array.isArray(data.options) && data.options.length > 0) {
        setAiOptions(data.options);
        setAiNotice(
          locale === "ar"
            ? "تم توليد خيارات جديدة وفق أهدافك الحالية!"
            : "Generated fresh choices tailored to your current goals!",
        );
      }
    } catch {
      setAiNotice(copy.msqAiFallback);
    } finally {
      setGeneratingAi(false);
    }
  };

  const computeSynthesized = (sel: string[], text: string) => {
    if (msqDef && (sel.length > 0 || activeOptions.length > 0)) {
      return formatMsqAnswer(
        { ...msqDef, options: activeOptions },
        sel,
        text,
      );
    }
    return text.trim();
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const synthesized = computeSynthesized(selected, customText);
    onSave(synthesized, selected);
  };

  return (
    <form className="msq-form" onSubmit={handleSubmit}>
      <div className="msq-prompt-header">
        <h2>{msqDef?.title ?? question[1]}</h2>
        <p>{msqDef?.subtitle ?? question[2]}</p>
        {meta?.planFields?.length ? (
          <p className="msq-meta-hint">
            {locale === "ar"
              ? `قد يساعد في: ${meta.planFields.map((f) => copy.planFieldNames[f] ?? f).join("، ")}`
              : `May inform: ${meta.planFields.map((f) => copy.planFieldNames[f] ?? f).join(", ")}`}
          </p>
        ) : null}
      </div>

      {activeOptions.length > 0 && (
        <div className="msq-options-container">
          <div className="msq-badge-row">
            <span className="msq-mode-tag">
              <Sparkles size={13} />
              {profile ? displayArchetype(profile, locale).name : copy.msqFrameworkMode}
            </span>
            <small className="muted">
              {msqDef?.multiSelect ? copy.msqSelectAll : copy.msqSelectOne}
            </small>
          </div>

          <div className="msq-options-grid">
            {activeOptions.map((opt) => {
              const isSelected = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`msq-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleToggle(opt.id)}
                >
                  <div className="msq-card-head">
                    {opt.archetypeTag ? (
                      <span className="msq-opt-tag">{opt.archetypeTag}</span>
                    ) : (
                      <span />
                    )}
                    <span className={`msq-checkbox ${isSelected ? "checked" : ""}`}>
                      {isSelected && <Check size={14} />}
                    </span>
                  </div>
                  <strong>{opt.label}</strong>
                  {opt.subtext && <p>{opt.subtext}</p>}
                </button>
              );
            })}
          </div>

          <div className="msq-toolbar">
            <button
              type="button"
              className="text-button"
              disabled={generatingAi}
              onClick={handleGenerateAi}
            >
              <Sparkles size={14} />
              {generatingAi ? copy.msqGenerating : copy.msqGenerateAi}
            </button>
          </div>
        </div>
      )}

      {aiNotice && <p className="msq-notice">{aiNotice}</p>}

      <div className="msq-custom-box">
        <label
          htmlFor="reset-answer"
          className={activeOptions.length > 0 ? "msq-custom-label" : "sr-only"}
        >
          {copy.msqYourAnswer}
        </label>
        <textarea
          id="reset-answer"
          name="answer"
          rows={activeOptions.length > 0 ? 3 : 5}
          placeholder={
            activeOptions.length > 0
              ? copy.msqPlaceholderNuance
              : copy.msqPlaceholderOpen
          }
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onBlur={() => {
            const synthesized = computeSynthesized(selected, customText);
            if (synthesized !== answer) {
              update((s) => ({
                ...s,
                answers: { ...s.answers, [question[0]]: synthesized },
                selectedOptions: {
                  ...(s.selectedOptions || {}),
                  [question[0]]: selected,
                },
              }));
            }
          }}
        />
      </div>

      <div className="answer-actions">
        <small>
          {selected.length > 0
            ? copy.msqChosenCount(selected.length)
            : copy.msqSavedHint}
        </small>
        <button type="submit" className="button primary">
          {copy.msqSaveContinue} <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
function exportCalendar(
  state: State,
  checkInTexts: readonly string[],
  locale: "en" | "ar",
) {
  const copy = workspaceCopy(locale);
  download(
    buildIcsCalendar({
      summary: copy.icsSummary,
      prodId: copy.icsProdId,
      resetDate: state.resetDate,
      reminderTimes: state.reminderTimes,
      descriptions: checkInTexts,
    }),
    "lifeos-reflection-day.ics",
    "text/calendar",
  );
}

const translationLanguages = [
  ["ar", "Arabic"],
  ["en", "English"],
  ["fr", "French"],
  ["de", "German"],
  ["hi", "Hindi"],
  ["id", "Indonesian"],
  ["it", "Italian"],
  ["ja", "Japanese"],
  ["ko", "Korean"],
  ["pt", "Portuguese"],
  ["es", "Spanish"],
  ["tr", "Turkish"],
  ["ur", "Urdu"],
  ["zh-CN", "Chinese (Simplified)"],
] as const;

function GoogleTranslateCard({ state }: { state: State }) {
  const { locale } = useLanguage();
  const copy = workspaceCopy(locale);
  const [text, setText] = useState("");
  const [target, setTarget] = useState(locale === "ar" ? "en" : "ar");
  const [translation, setTranslation] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fill = (value: string) => {
    setText(value.slice(0, 5_000));
    setTranslation("");
    setDetectedLanguage("");
    setError("");
  };
  const direction = Object.values(state.plan).filter(Boolean).join("\n\n");
  const steps = state.tasks
    .filter((task) => !task.archived)
    .map((task) => task.title)
    .join("\n");
  const latestReflection = state.reflections.at(-1)?.note ?? "";
  const translate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        translation?: string;
        detectedSourceLanguage?: string | null;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "Translation failed.");
      setTranslation(result.translation ?? "");
      setDetectedLanguage(result.detectedSourceLanguage ?? "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Translation failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="card settings-card translate-card">
      <div className="section-heading">
        <div>
          <h2>{copy.translateTitle}</h2>
          <p>{copy.translateLead}</p>
        </div>
        <Languages size={22} />
      </div>
      <div className="translation-shortcuts" aria-label={copy.ariaChooseContent}>
        <button type="button" className="text-button" onClick={() => fill(direction)} disabled={!direction}>
          {copy.useDirection}
        </button>
        <button type="button" className="text-button" onClick={() => fill(steps)} disabled={!steps}>
          {copy.useSteps}
        </button>
        <button type="button" className="text-button" onClick={() => fill(latestReflection)} disabled={!latestReflection}>
          {copy.useReflection}
        </button>
      </div>
      <form className="translation-form" onSubmit={translate}>
        <label htmlFor="translation-source">{copy.textToTranslate}</label>
        <textarea
          id="translation-source"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={5_000}
          rows={5}
          required
          placeholder={copy.translatePlaceholder}
        />
        <div className="translation-actions">
          <label htmlFor="translation-target">{copy.translateTo}</label>
          <select id="translation-target" value={target} onChange={(event) => setTarget(event.target.value)}>
            {translationLanguages.map(([code, label]) => (
              <option key={code} value={code}>
                {copy.translationLanguages[code] ?? label}
              </option>
            ))}
          </select>
          <button className="button primary" disabled={busy || !text.trim()}>
            {busy ? copy.translating : copy.translateButton}
          </button>
        </div>
      </form>
      {error && <p className="translation-error" role="alert">{error}</p>}
      {translation && (
        <div className="translation-result" aria-live="polite">
          <span className="tiny-label">
            {copy.translationResult}{detectedLanguage ? ` · ${copy.detectedLanguage} ${detectedLanguage}` : ""}
          </span>
          <p>{translation}</p>
        </div>
      )}
      <p className="key-note">
        {copy.translateKeyNote}
      </p>
    </section>
  );
}

export function SettingsView({
  state,
  onModal,
  onNotice,
}: {
  state: State;
  onModal: (m: Modal) => void;
  onNotice: (s: string) => void;
}) {
  const { locale } = useLanguage();
  const copy = workspaceCopy(locale);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{copy.settingsEyebrow}</span>
          <h1>
            {copy.settingsTitle}
            <span className="heading-dot">.</span>
          </h1>
          <p>{copy.settingsLead}</p>
        </div>
      </div>
      <section className="card settings-card">
        <h2>{copy.personalTouch}</h2>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              update((s) => ({
                ...s,
                name: String(
                  new FormData(e.currentTarget).get("name") || "",
                ).trim(),
              }))
            )
              onNotice(copy.nameSaved);
          }}
        >
          <label htmlFor="name">{copy.nameLabel}</label>
          <input
            id="name"
            name="name"
            defaultValue={state.name}
            maxLength={50}
            placeholder={copy.namePlaceholder}
          />
          <button className="button primary">{copy.saveName}</button>
        </form>
      </section>
      <GoogleTranslateCard state={state} />
      <section className="card settings-card">
        <div className="section-heading">
          <div>
            <h2>{copy.devSectionTitle}</h2>
            <p>{copy.devSectionLead}</p>
          </div>
          <Award size={22} />
        </div>
        <p className="assessment-disclaimer">{copy.settingsPsychDisclaimer}</p>
        {state.assessmentProfile ? (
          <div>
            <div className="settings-profile-summary">
              <span className="eyebrow">{copy.yourArchetype}</span>
              <h3>
                {displayArchetype(state.assessmentProfile, locale).name}
              </h3>
              <p>
                {displayArchetype(state.assessmentProfile, locale).description}
              </p>
            </div>
            <div className="profile-tags-row">
              <span className="tag">
                {copy.motiveLabel}: {copy.motives[state.assessmentProfile.coreMotive] ?? state.assessmentProfile.coreMotive.toUpperCase()}
              </span>
              <span className="tag">
                {copy.discPaceLabel}: {copy.discStyles[state.assessmentProfile.discStyle] ?? state.assessmentProfile.discStyle}
              </span>
              <span className="tag">
                {copy.needLabel}: {copy.needs[state.assessmentProfile.primaryNeed] ?? state.assessmentProfile.primaryNeed}
              </span>
              <span className="tag">
                {copy.consciousnessLabel}: {state.assessmentProfile.consciousnessLevel}+
              </span>
              {state.assessmentProfile.maslowCenter && (
                <span className="tag">
                  {copy.maslowCenterLabel}:{" "}
                  {
                    MASLOW_TIER_LABELS[state.assessmentProfile.maslowCenter][
                      locale
                    ]
                  }
                </span>
              )}
            </div>
            <div className="settings-buttons" style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => onModal({ type: "assessment" })}
              >
                <RotateCcw size={16} />
                {copy.retakeAssessment}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>{copy.assessmentInvite}</p>
            <button
              type="button"
              className="button primary"
              onClick={() => onModal({ type: "assessment" })}
            >
              <Sparkles size={16} />
              {copy.takeAssessment}
            </button>
          </div>
        )}
      </section>
      <section className="card settings-card">
        <h2>{copy.dataTitle}</h2>
        <p>{copy.dataLead}</p>
        <div className="settings-buttons">
          <button
            className="button secondary"
            onClick={() =>
              download(
                JSON.stringify(state, null, 2),
                `lifeos-${localDate()}.json`,
              )
            }
          >
            <Download size={17} />
            {copy.exportBackup}
          </button>
          <label className="button secondary file-button">
            <Upload size={17} />
            {copy.importBackup}
            <input
              aria-label={copy.importBackup}
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  if (file.size > 5_000_000)
                    throw new Error(copy.backupSizeError);
                  onModal({
                    type: "import",
                    data: decode(JSON.parse(await file.text())),
                  });
                } catch (err) {
                  onNotice(
                    err instanceof Error
                      ? err.message
                      : copy.backupReadError,
                  );
                }
              }}
            />
          </label>
          <button
            className="button secondary"
            onClick={() => {
              try {
                exportOriginal();
              } catch {
                onNotice(copy.storageUnavailable);
              }
            }}
          >
            {copy.exportRaw}
          </button>
          <button
            className="button secondary"
            onClick={() => {
              try {
                exportLegacy();
              } catch (error) {
                onNotice(
                  error instanceof Error
                    ? error.message
                    : copy.legacyExportError,
                );
              }
            }}
          >
            {copy.exportLegacy}
          </button>
          <button
            className="button secondary"
            onClick={() => {
              if (
                !window.confirm(copy.confirmRecover)
              )
                return;
              try {
                if (recoverBackup()) onNotice(copy.recoveredNotice);
              } catch (err) {
                onNotice(
                  err instanceof Error ? err.message : copy.recoveryFailed,
                );
              }
            }}
          >
            <RotateCcw size={16} />
            {copy.recoverWorkspace}
          </button>
        </div>
      </section>
      {state.tasks.some((t) => t.archived) && (
        <section className="card settings-card">
          <h2>{copy.archivedStepsTitle}</h2>
          {state.tasks
            .filter((t) => t.archived)
            .map((t) => (
              <div className="task-row" key={t.id}>
                <span className="task-content">{t.title}</span>
                <button
                  className="text-button"
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      tasks: s.tasks.map((x) =>
                        x.id === t.id ? { ...x, archived: false } : x,
                      ),
                    }))
                  }
                >
                  {copy.bringBack} <RotateCcw size={15} />
                </button>
              </div>
            ))}
        </section>
      )}
      <section className="card settings-card">
        <h2>{copy.freshChapterTitle}</h2>
        <p>{copy.freshChapterLead}</p>
        <button
          className="button danger"
          onClick={() => onModal({ type: "reset" })}
        >
          {copy.resetWorkspace}
        </button>
      </section>
    </>
  );
}
