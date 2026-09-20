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
  Pencil,
} from "lucide-react";
import {
  update,
  download,
  exportOriginal,
  exportLegacy,
  recoverBackup,
} from "@/lib/store";
import {
  checkInPrompts,
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
          "Your step is ready for today.",
        );
      }}
    >
      <p>
        Make it specific, kind, and small enough to start. This step repeats
        daily until you archive it.
      </p>
      <label htmlFor="task-title">What will you do?</label>
      <input
        id="task-title"
        name="title"
        autoFocus
        required
        maxLength={240}
        defaultValue={task?.title || ""}
        placeholder="e.g. Take a 15-minute walk after lunch"
      />
      <label htmlFor="task-time">
        Make time for it <span className="muted">(optional)</span>
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
                "Step archived. Your past progress is kept.",
              )
            }
          >
            <Archive size={16} />
            Archive step
          </button>
        )}
        <button className="button primary">
          Save step <Check size={16} />
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
      title: "1. Explore what you want to change",
      explanation:
        "Begin by noticing your current patterns and what you want your future to look like. You are gathering ideas; you do not need a finished plan.",
      recommendation:
        "Start with a recent everyday moment. A phrase or a few words is enough to begin.",
    },
    daytime: {
      title: "2. Notice your day as it happens",
      explanation:
        "Pause during ordinary activities and compare where your attention went with where you wanted it to go. These observations can inform your evening answers.",
      recommendation:
        "Choose reminder times that fit your day. Export and import them into your calendar, or use the reflection buttons here when you pause.",
    },
    evening: {
      title: "3. Turn what you noticed into a direction",
      explanation:
        "Look for what you want to leave behind, what you want to move toward, and a small next step. You can review an editable plan draft after these questions.",
      recommendation:
        "Use something you actually noticed today. Your first direction is allowed to be provisional.",
    },
  }[phase];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ONE DAY. A CLEARER DIRECTION.</span>
          <h1>
            Your reset<span className="heading-dot">.</span>
          </h1>
          <p>
            Reflection today. Small changes over time. Pause and return whenever
            you need.
          </p>
        </div>
        <span className="tag">
          <Check size={14} />
          Each answer saved separately
        </span>
      </div>
      <div className="phase-nav" role="tablist" aria-label="Reset phases">
        {(
          [
            {
              id: "morning",
              title: "Morning",
              subtitle: "Make space · 15–30 min",
              icon: Sun,
            },
            {
              id: "daytime",
              title: "Throughout the day",
              subtitle: "Notice your patterns",
              icon: Coffee,
            },
            {
              id: "evening",
              title: "Evening",
              subtitle: "Find your next direction",
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
        aria-label="Guidance for this phase"
      >
        <h2>{phaseGuide.title}</h2>
        <p>{phaseGuide.explanation}</p>
        <p>
          <strong>Try this:</strong> {phaseGuide.recommendation}
        </p>
      </section>
      {phase !== "daytime" ? (
        <>
          {state.assessmentProfile ? (
            <div className="assessment-active-banner">
              <div className="banner-left">
                <Sparkles size={16} />
                <span>
                  Attuned to <strong>{state.assessmentProfile.archetypeName}</strong> ({state.assessmentProfile.coreMotive.toUpperCase()} motive) • Quick-tap MSQs active
                </span>
              </div>
              {onOpenAssessment && (
                <button
                  type="button"
                  className="text-button"
                  onClick={onOpenAssessment}
                >
                  Recalibrate
                </button>
              )}
            </div>
          ) : (
            <div className="assessment-invite-banner">
              <div className="banner-left">
                <Zap size={16} />
                <span>
                  <strong>Tired of typing essays?</strong> Complete the 2-min baseline assessment to unlock personalized multiple-choice reflections.
                </span>
              </div>
              {onOpenAssessment && (
                <button
                  type="button"
                  className="button secondary sm"
                  onClick={onOpenAssessment}
                >
                  Take Assessment <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
          <section className="card question-card">
            <div className="section-heading">
              <span className="eyebrow">
                {phase} / QUESTION {index + 1} OF {questions.length}
              </span>
              <span className="tag">
                {questions.filter(([id]) => state.answers[id]?.trim()).length}{" "}
                explored
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
                  onNotice("Answer saved.");
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
              <ArrowLeft size={16} />
              Previous
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
              Skip for now <ArrowRight size={16} />
            </button>
          </div>
          <p className="privacy-note">
            These answers are for you. Use your own words; you don’t have to
            answer everything.
          </p>
        </section>
      </>
    ) : (
        <>
          <section className="card">
            <div className="section-heading">
              <div>
                <h2>A few pauses can change the shape of a day.</h2>
                <p>
                  Adjust these times to your schedule. Export reminders to your
                  calendar so they work when this app is closed.
                </p>
              </div>
            </div>
            <label htmlFor="reset-date">Your reflection day</label>
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
              {checkInPrompts.map((prompt, i) => (
                <div className="reminder-row" key={prompt}>
                  <label className="sr-only" htmlFor={`reminder-${i}`}>
                    Time for reflection {i + 1}
                  </label>
                  <input
                    id={`reminder-${i}`}
                    type="time"
                    aria-label={`Time for reflection ${i + 1}`}
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
                    aria-label={`Reflect: ${prompt}`}
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
                  exportCalendar(state);
                  onNotice(
                    "Calendar file downloaded. Import it in your calendar to enable reminders.",
                  );
                }}
              >
                <CalendarDays size={17} />
                Export reminders
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setPhase("evening");
                  setIndex(0);
                }}
              >
                Continue to evening <ArrowRight size={17} />
              </button>
            </div>
          </section>
        </>
      )}
      <div className="journey-handoff">
        <div>
          <strong>Ready to connect your answers?</strong>
          <p>
            My direction brings your ideas into a plan you can revise. You can
            go there before answering everything.
          </p>
        </div>
        <button
          type="button"
          className="button secondary"
          aria-label="Continue to your plan"
          onClick={onDirection}
        >
          Continue to your plan <ArrowRight size={16} />
        </button>
      </div>
      <p className="source-note">
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
  const msqDef = getPromptMsq(question[0], profile);
  const [selected, setSelected] = useState<string[]>(selectedOptionIds);
  const [customText, setCustomText] = useState("");
  const [showCustom, setShowCustom] = useState(false);
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
    if (msqDef) {
      const synthesized = formatMsqAnswer(
        { ...msqDef, options: activeOptions },
        next,
        customText,
      );
      onSave(synthesized, next);
    }
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
        setAiNotice("Generated fresh choices tailored to your current goals!");
      }
    } catch {
      setAiNotice("Could not reach AI provider. Showing calibrated archetype options.");
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="msq-form">
      <div className="msq-prompt-header">
        <h2>{question[1]}</h2>
        <p>{question[2]}</p>
      </div>

      {activeOptions.length > 0 ? (
        <div className="msq-options-container">
          <div className="msq-badge-row">
            <span className="msq-mode-tag">
              <Sparkles size={13} />
              {profile ? `${profile.archetypeName}` : "Framework MSQ Mode"}
            </span>
            <small className="muted">
              {msqDef?.multiSelect ? "Select all that resonate" : "Choose the closest match"}
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
        </div>
      ) : (
        <textarea
          id="reset-answer"
          name="answer"
          defaultValue={answer}
          rows={5}
          placeholder="Reflect on this prompt in your own words…"
          onBlur={(e) => {
            const val = e.target.value.trim();
            if (val !== answer) onSave(val, []);
          }}
        />
      )}

      <div className="msq-toolbar">
        <button
          type="button"
          className="text-button"
          disabled={generatingAi}
          onClick={handleGenerateAi}
        >
          <Sparkles size={14} />
          {generatingAi ? "Generating options with AI…" : "Generate AI-tailored choices"}
        </button>

        <button
          type="button"
          className="text-button"
          onClick={() => setShowCustom(!showCustom)}
        >
          <Pencil size={14} />
          {showCustom ? "Hide notes" : "Add personal nuance / notes"}
        </button>
      </div>

      {aiNotice && <p className="msq-notice">{aiNotice}</p>}

      {showCustom && (
        <div className="msq-custom-box">
          <label htmlFor="custom-notes">Personal nuance or additional thoughts (optional)</label>
          <textarea
            id="custom-notes"
            rows={3}
            placeholder="Type any specific details or nuance here…"
            value={customText}
            onChange={(e) => {
              const nextText = e.target.value;
              setCustomText(nextText);
              if (msqDef) {
                const synthesized = formatMsqAnswer(
                  { ...msqDef, options: activeOptions },
                  selected,
                  nextText,
                );
                onSave(synthesized, selected);
              }
            }}
          />
        </div>
      )}

      <div className="answer-actions">
        <small>
          {selected.length > 0
            ? `${selected.length} chosen. Your selection is automatically saved.`
            : "Tap an option to select, or skip to move forward."}
        </small>
        <button
          type="button"
          className="button primary"
          onClick={() => {
            if (msqDef) {
              const synthesized = formatMsqAnswer(
                { ...msqDef, options: activeOptions },
                selected,
                customText,
              );
              onSave(synthesized, selected);
            } else {
              onSave(answer, []);
            }
          }}
        >
          Save & continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
function exportCalendar(state: State) {
  const esc = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const events = checkInPrompts.map((p, i) =>
    [
      "BEGIN:VEVENT",
      `UID:${state.resetDate}-${i}@lifeos.local`,
      `DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}`,
      `DTSTART:${state.resetDate.replace(/-/g, "")}T${state.reminderTimes[i].replace(":", "")}00`,
      "DURATION:PT5M",
      "SUMMARY:LifeOS - A mindful pause",
      `DESCRIPTION:${esc(p)}`,
      "BEGIN:VALARM",
      "TRIGGER:PT0M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(p)}`,
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n"),
  );
  download(
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LifeOS//Reflection day//EN",
      "CALSCALE:GREGORIAN",
      ...events,
      "END:VCALENDAR",
      "",
    ].join("\r\n"),
    "lifeos-reflection-day.ics",
    "text/calendar",
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
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR SPACE, YOUR CHOICE</span>
          <h1>
            Make yourself at home<span className="heading-dot">.</span>
          </h1>
          <p>
            Your reflections stay in this browser. Back them up when they matter
            to you.
          </p>
        </div>
      </div>
      <section className="card settings-card">
        <h2>A personal touch</h2>
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
              onNotice("Your name is saved.");
          }}
        >
          <label htmlFor="name">What should we call you?</label>
          <input
            id="name"
            name="name"
            defaultValue={state.name}
            maxLength={50}
            placeholder="Your first name"
          />
          <button className="button primary">Save name</button>
        </form>
      </section>
      <section className="card settings-card">
        <div className="section-heading">
          <div>
            <h2>Human Development & Psychometrics</h2>
            <p>
              Calibrated baseline frameworks from MatchWise powering your quick-tap
              reflection MSQs.
            </p>
          </div>
          <Award size={22} />
        </div>
        {state.assessmentProfile ? (
          <div>
            <div className="settings-profile-summary">
              <span className="eyebrow">YOUR CALIBRATED ARCHETYPE</span>
              <h3>{state.assessmentProfile.archetypeName}</h3>
              <p>{state.assessmentProfile.motiveDescription}</p>
            </div>
            <div className="profile-tags-row">
              <span className="tag">
                Motive: {state.assessmentProfile.coreMotive.toUpperCase()}
              </span>
              <span className="tag">
                DISC Pace: {state.assessmentProfile.discStyle}
              </span>
              <span className="tag">
                Need: {state.assessmentProfile.primaryNeed}
              </span>
              <span className="tag">
                Consciousness: {state.assessmentProfile.consciousnessLevel}+
              </span>
            </div>
            <div className="settings-buttons" style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => onModal({ type: "assessment" })}
              >
                <RotateCcw size={16} />
                Retake Baseline Assessment
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>
              Take our 2-minute baseline assessment to discover your core motive,
              stress triggers, and execution style, and eliminate daily typing
              friction.
            </p>
            <button
              type="button"
              className="button primary"
              onClick={() => onModal({ type: "assessment" })}
            >
              <Sparkles size={16} />
              Take Baseline Assessment
            </button>
          </div>
        )}
      </section>
      <section className="card settings-card">
        <h2>Your data belongs to you</h2>
        <p>
          No account or cloud connection is required. Browser storage is not
          encrypted; use a trusted device. Clearing browser data removes your
          workspace.
        </p>
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
            Export backup
          </button>
          <label className="button secondary file-button">
            <Upload size={17} />
            Import backup
            <input
              aria-label="Import backup"
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  if (file.size > 5_000_000)
                    throw new Error("Please use a backup smaller than 5 MB.");
                  onModal({
                    type: "import",
                    data: decode(JSON.parse(await file.text())),
                  });
                } catch (err) {
                  onNotice(
                    err instanceof Error
                      ? err.message
                      : "Could not read this backup.",
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
                onNotice(
                  "Browser storage is unavailable. You can still export the loaded backup above.",
                );
              }
            }}
          >
            Export raw saved data
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
                    : "Could not export legacy data.",
                );
              }
            }}
          >
            Export legacy v1 data
          </button>
          <button
            className="button secondary"
            onClick={() => {
              if (
                !window.confirm(
                  "Restore the backup from before your last reset or import? This replaces your current workspace.",
                )
              )
                return;
              try {
                if (recoverBackup()) onNotice("Previous data restored.");
              } catch (err) {
                onNotice(
                  err instanceof Error ? err.message : "Recovery failed.",
                );
              }
            }}
          >
            <RotateCcw size={16} />
            Recover previous workspace
          </button>
        </div>
      </section>
      {state.tasks.some((t) => t.archived) && (
        <section className="card settings-card">
          <h2>Archived steps</h2>
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
                  Bring back <RotateCcw size={15} />
                </button>
              </div>
            ))}
        </section>
      )}
      <section className="card settings-card">
        <h2>A fresh chapter</h2>
        <p>
          Start over with a blank plan. We’ll keep a recovery copy of your
          previous workspace.
        </p>
        <button
          className="button danger"
          onClick={() => onModal({ type: "reset" })}
        >
          Reset workspace
        </button>
      </section>
    </>
  );
}
