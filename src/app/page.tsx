"use client";
import { useState } from "react";
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
} from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { AiAssistant } from "@/components/AiAssistant";
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

type View =
  "today" | "reset" | "direction" | "journal" | "assistant" | "settings";
const navigation = [
  { id: "today", label: "Today", icon: Sun },
  { id: "reset", label: "Your reset", icon: Compass },
  { id: "direction", label: "My direction", icon: Sprout },
  { id: "journal", label: "Reflections", icon: BookOpen },
  { id: "assistant", label: "AI guide", icon: Bot },
] as const;
const planLabels: Record<keyof Plan, string> = {
  vision: "The life I’m moving toward",
  antiVision: "What I want to leave behind",
  identity: "The person I’m practicing becoming",
  year: "One meaningful outcome this year",
  month: "My project for this month",
  constraints: "What I will protect (one per line)",
};

export default function Home() {
  const snapshot = useLifeOS();
  const [view, setView] = useState<View>("today");
  const [modal, setModal] = useState<Modal>(null);
  const [notice, setNotice] = useState("");
  if (!snapshot)
    return (
      <main className="loading">
        <Leaf size={32} />
        <p>Making room for a better day…</p>
      </main>
    );
  const { state, date, error, blocked } = snapshot;
  const day = state.days[date] ?? emptyDay();
  const stats = progress(state, date);
  const tasks = state.tasks.filter((t) => !t.archived);
  const completed = tasks.filter((t) => day.completed.includes(t.id)).length;
  const answered = prompts.filter(([id]) => state.answers[id]?.trim()).length;
  const close = () => setModal(null);
  const saved = (ok: boolean, message = "Saved. One small step forward.") => {
    if (ok) {
      setNotice(message);
      close();
    }
  };
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
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
        <div className="workspace-label">A LITTLE MORE INTENTIONAL</div>
        <nav aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-current={view === id ? "page" : undefined}
              className={view === id ? "nav-item active" : "nav-item"}
              onClick={() => setView(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "reset" && answered < prompts.length && (
                <span className="nav-badge">
                  {answered ? `${answered}/${prompts.length}` : "Start"}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="tiny-label">YOUR OWN PACE</span>
            <p>
              Small steps.
              <br />A life that feels like yours.
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
            Settings & data
          </button>
          <div className="profile">
            <span className="avatar">
              {state.name.trim().slice(0, 1).toUpperCase() || "Y"}
            </span>
            <div>
              <strong>{state.name || "Your space"}</strong>
              <small>Saved on this device</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Your space</span>
            <span className="crumb-divider">/</span>
            <strong>
              {view === "settings"
                ? "Settings & data"
                : navigation.find((n) => n.id === view)?.label}
            </strong>
          </div>
          <span className="date">
            <CalendarDays size={15} />
            {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          {(error || blocked) && (
            <div role="alert" className="alert">
              {error}{" "}
              <button onClick={() => setView("settings")}>
                Open data settings <ArrowRight size={14} />
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
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {view === "today" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">MAKE SPACE FOR WHAT MATTERS</span>
                  <h1>
                    {greeting}
                    {state.name ? `, ${state.name}` : ""}
                    <span className="heading-dot">.</span>
                  </h1>
                  <p>
                    You don’t need to change everything. Just choose your next
                    step.
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => setModal({ type: "checkin" })}
                >
                  <Coffee size={17} />
                  Take a mindful pause
                </button>
              </div>
              <section
                className={`hero-card ${tasks.length || state.plan.vision ? "compact" : ""}`}
              >
                <div className="hero-copy">
                  <span className="pill">
                    <span />{" "}
                    {answered === prompts.length
                      ? "YOUR NEXT CHAPTER"
                      : "A DAY TO FIND YOUR DIRECTION"}
                  </span>
                  <h2>
                    {answered === prompts.length
                      ? "Clarity begins with you.\nProgress begins today."
                      : "A fresh start.\nOn your terms."}
                  </h2>
                  <p>
                    {state.plan.vision ||
                      "Step back, reconnect with what you want, and turn that clarity into a few small, meaningful actions."}
                  </p>
                  <button
                    className="button light"
                    onClick={() =>
                      setView(
                        answered === prompts.length ? "direction" : "reset",
                      )
                    }
                  >
                    {answered
                      ? "Continue your journey"
                      : "Begin your one-day reset"}
                    <ArrowUpRight size={18} />
                  </button>
                  <span className="hero-footnote">
                    Your words. Your pace. Room to change your mind.
                  </span>
                </div>
                <div className="sunrise-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="sun-disc" />
                  <div className="hill hill-back" />
                  <div className="hill hill-front" />
                  <div className="art-caption">GROW AT YOUR OWN PACE</div>
                </div>
              </section>
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
                    <small>Priorities completed</small>
                  </div>
                </div>
                <div>
                  <span className="stat-icon peach">
                    <Leaf size={19} />
                  </span>
                  <div>
                    <strong>
                      {stats.streak}
                      <em> {stats.streak === 1 ? "day" : "days"}</em>
                    </strong>
                    <small>Showing up for yourself</small>
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
                    <small>Reflections explored</small>
                  </div>
                </div>
              </div>
              <div className="dashboard-grid">
                <section className="card priorities">
                  <div className="section-heading">
                    <div>
                      <h2>Today’s small steps</h2>
                      <p>Focus on a few things that move you forward.</p>
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
                      <h3>What would make today feel worthwhile?</h3>
                      <p>
                        Start with one manageable action. Two or three is
                        plenty.
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
                          aria-label={`${day.completed.includes(task.id) ? "Undo" : "Complete"} ${task.title}`}
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
                            {index === 0 ? "YOUR MAIN FOCUS" : "A SMALL STEP"}
                            {task.time ? ` · ${task.time}` : ""}
                          </span>
                          <strong>{task.title}</strong>
                        </div>
                        <button
                          className="icon-button"
                          aria-label={`Edit ${task.title}`}
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
                    Add a small step
                  </button>
                  {completed > 0 && completed === tasks.length && (
                    <p className="success-line">
                      <Check size={16} />
                      You made room for what matters today. Enjoy some rest.
                    </p>
                  )}
                </section>
                <section className="card direction-card">
                  <span className="eyebrow">YOUR NORTH STAR</span>
                  <span className="north-star" aria-hidden="true">
                    ✳
                  </span>
                  <h2>
                    A little reminder
                    <br /> of your why.
                  </h2>
                  <p>
                    {state.plan.identity ||
                      "You get to decide what a meaningful life looks like for you."}
                  </p>
                  <div className="divider" />
                  <span className="tiny-label">THIS MONTH, I’M WORKING ON</span>
                  <h3>{state.plan.month || "Something that matters to me."}</h3>
                  <button
                    className="text-button"
                    onClick={() => setView("direction")}
                  >
                    See my direction <ArrowRight size={16} />
                  </button>
                </section>
              </div>
              <div className="dashboard-grid bottom-grid">
                <section className="card">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">A MOMENT TO NOTICE</span>
                      <h2>How are you arriving today?</h2>
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
                        {m}
                      </button>
                    ))}
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setModal({ type: "checkin" })}
                  >
                    Leave yourself a note <ArrowRight size={15} />
                  </button>
                </section>
                <section className="gentle-note">
                  <span className="note-flower" aria-hidden="true">
                    ✳
                  </span>
                  <div>
                    <span className="tiny-label">A GENTLE REMINDER</span>
                    <p>
                      Consistency is coming back.
                      <br />
                      Even after a difficult day.
                    </p>
                    <span>Your progress is still yours.</span>
                  </div>
                </section>
              </div>
            </>
          )}
          {view === "today" && state.plan.constraints.trim() && (
            <section className="card boundaries">
              <div className="section-heading">
                <div>
                  <h2>What I’m protecting today</h2>
                  <p>
                    Success includes keeping space for the things you value.
                  </p>
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
              onDraft={() =>
                setModal({
                  type: "plan",
                  draft: {
                    ...state.plan,
                    identity: state.answers.m13 || state.plan.identity,
                    antiVision: state.answers.e3 || state.plan.antiVision,
                    vision: state.answers.e4 || state.plan.vision,
                    year: state.answers.e5 || state.plan.year,
                    month: state.answers.e6 || state.plan.month,
                  },
                })
              }
              onCheckIn={(prompt) => setModal({ type: "checkin", prompt })}
              onNotice={setNotice}
            />
          )}
          {view === "direction" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">A COMPASS, NOT A FINISH LINE</span>
                  <h1>
                    My direction<span className="heading-dot">.</span>
                  </h1>
                  <p>
                    A living plan. Adjust it as you learn more about yourself.
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() => setModal({ type: "plan" })}
                >
                  <Pencil size={16} />
                  Edit my plan
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
                    <p>
                      {state.plan[key] ||
                        "Still taking shape. Make room to explore this in your reset."}
                    </p>
                  </section>
                ))}
              </div>
              <section className="card project-card">
                <div className="section-heading">
                  <div>
                    <h2>This month, one step at a time</h2>
                    <p>
                      {state.plan.month ||
                        "Choose a small project in your plan, then break it down here."}
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
                      aria-label={`${step.done ? "Undo" : "Complete"} ${step.title}`}
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
                      aria-label={`Remove ${step.title}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Remove this project step? Its progress points will also be removed.",
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
                    New project step
                  </label>
                  <input
                    id="project-step"
                    name="step"
                    required
                    maxLength={240}
                    placeholder="One concrete step toward this project…"
                  />
                  <button className="button secondary">
                    <Plus size={16} />
                    Add step
                  </button>
                </form>
              </section>
            </>
          )}
          {view === "journal" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">NOTICE. LEARN. BEGIN AGAIN.</span>
                  <h1>
                    Room to reflect<span className="heading-dot">.</span>
                  </h1>
                  <p>
                    Your progress includes the things you notice along the way.
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() => setModal({ type: "checkin" })}
                >
                  <Plus size={17} />
                  New reflection
                </button>
              </div>
              <section className="card week-card">
                <div className="section-heading">
                  <div>
                    <h2>Your last seven days</h2>
                    <p>
                      Every completed step counts. Empty days are room to begin
                      again.
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
                          {d.toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </small>
                      </div>
                    );
                  })}
                </div>
                <p className="chart-caption">
                  {stats.total} progress points · Level {stats.level} ·{" "}
                  {stats.xp}/{stats.next} to your next level
                </p>
              </section>
              {!state.reflections.length && (
                <section className="card empty-state">
                  <BookOpen size={30} />
                  <h2>Nothing to catch up on.</h2>
                  <p>Start with one thing you noticed today.</p>
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
                          {new Date(r.timestamp).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        <span className="tag">{r.mood || "Reflection"}</span>
                      </div>
                      <p className="preserve-lines">{r.note}</p>
                    </article>
                  ))}
              </div>
            </>
          )}
          {view === "assistant" && <AiAssistant state={state} date={date} />}
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
            <span>A little more intention, every day.</span>
            <a
              href="https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1"
              target="_blank"
              rel="noreferrer"
            >
              Inspired by Dan Koe <ArrowUpRight size={12} />
            </a>
          </footer>
        </main>
      </div>
      {modal?.type === "task" && (
        <Dialog
          title={modal.task ? "Make this step your own" : "One small step"}
          onClose={close}
        >
          <TaskForm task={modal.task} onSave={saved} />
        </Dialog>
      )}
      {modal?.type === "checkin" && (
        <Dialog title="A moment to come back to yourself" onClose={close}>
          <p>
            {modal.prompt ||
              "What are you noticing? What would help you take your next small step?"}
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
                  "Reflection saved. Thank you for showing up.",
                );
            }}
          >
            <label htmlFor="reflection-note">Your reflection</label>
            <textarea
              autoFocus
              id="reflection-note"
              name="note"
              required
              maxLength={10000}
              rows={5}
              placeholder="There’s no right answer…"
            />
            <label htmlFor="reflection-mood">How does this moment feel?</label>
            <select
              id="reflection-mood"
              name="mood"
              defaultValue={day.mood || "Steady"}
            >
              {[
                "Low energy",
                "A little scattered",
                "Steady",
                "Feeling good",
              ].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <div className="dialog-actions">
              <button
                type="button"
                className="button secondary"
                onClick={close}
              >
                Come back later
              </button>
              <button className="button primary">
                Save reflection <Check size={16} />
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {modal?.type === "plan" && (
        <Dialog
          title={
            modal.draft ? "Review your direction" : "Your plan, in your words"
          }
          onClose={close}
        >
          {modal.draft && (
            <p>
              This draft uses your own answers. Edit anything before saving.
              Your daily actions can be added from Today.
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const plan = Object.fromEntries(
                Object.keys(planLabels).map((key) => [
                  key,
                  String(form.get(key)).trim(),
                ]),
              ) as Plan;
              saved(
                update((s) => ({ ...s, plan })),
                "Your direction is saved. Keep it flexible.",
              );
            }}
          >
            {(Object.keys(planLabels) as (keyof Plan)[]).map((key) => (
              <div key={key}>
                <label htmlFor={`plan-${key}`}>{planLabels[key]}</label>
                <textarea
                  id={`plan-${key}`}
                  name={key}
                  defaultValue={(modal.draft || state.plan)[key]}
                  rows={2}
                  maxLength={5000}
                />
              </div>
            ))}
            <div className="dialog-actions">
              <button
                type="button"
                className="button secondary"
                onClick={close}
              >
                Cancel
              </button>
              <button className="button primary">
                Save my direction <Check size={16} />
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {modal?.type === "reset" && (
        <Dialog title="Start a fresh chapter?" onClose={close}>
          <p>
            This clears your current plan, tasks, and reflections. A local
            recovery copy is saved first. Download a backup to keep a permanent
            copy.
          </p>
          <div className="dialog-actions">
            <button
              className="button secondary"
              onClick={() =>
                download(JSON.stringify(state, null, 2), `lifeos-${date}.json`)
              }
            >
              <Download size={16} />
              Download backup
            </button>
            <button
              className="button danger"
              onClick={() =>
                saved(restore(freshState()), "A fresh chapter is ready.")
              }
            >
              Save recovery copy & reset
            </button>
          </div>
        </Dialog>
      )}
      {modal?.type === "import" && (
        <Dialog title="Restore this backup?" onClose={close}>
          <p>
            This backup contains {modal.data.tasks.length} steps and{" "}
            {modal.data.reflections.length} reflections. It will replace the
            current workspace. A recovery copy of your current data is saved
            first.
          </p>
          <div className="dialog-actions">
            <button className="button secondary" onClick={close}>
              Cancel
            </button>
            <button
              className="button primary"
              onClick={() =>
                saved(restore(modal.data), "Backup restored successfully.")
              }
            >
              Restore backup
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
