"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Bot,
  Check,
  KeyRound,
  Lightbulb,
  Link2Off,
  LockKeyhole,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  AI_PROVIDERS,
  AI_PROVIDER_INFO,
  type AiAnalysis,
  type AiChatMessage,
  type AiContext,
  type AiProvider,
} from "@/lib/ai";
import { emptyDay, prompts, type State } from "@/lib/domain";
import { update } from "@/lib/store";
import { useLanguage } from "@/lib/language";
import { assistantCopy } from "@/lib/locale/assistant";

type ConnectionHealth = "working" | "slow" | "down";
type Status = {
  connected: boolean;
  model: string | null;
  provider: AiProvider | null;
  health?: Exclude<ConnectionHealth, "down">;
  latencyMs?: number;
};

function ConnectionIndicator({
  health,
  latencyMs,
  labels,
}: {
  health: ConnectionHealth;
  latencyMs?: number;
  labels: { working: string; slow: string; down: string };
}) {
  const label =
    health === "working"
      ? labels.working
      : health === "slow"
        ? labels.slow
        : labels.down;
  return (
    <span
      className={`ai-connection-status ${health}`}
      role="status"
      aria-label={`AI connection: ${label}`}
    >
      <span className="ai-connection-dot" aria-hidden="true" />
      {label}
      {latencyMs !== undefined && (
        <small>{(latencyMs / 1000).toFixed(1)}s</small>
      )}
    </span>
  );
}
async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok)
    throw new Error(body.error || "The request could not be completed.");
  return body;
}
export function AiAssistant({ state, date }: { state: State; date: string }) {
  const { locale } = useLanguage();
  const ac = assistantCopy(locale);
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [chat, setChat] = useState<AiChatMessage[]>([]);
  const [provider, setProvider] = useState<AiProvider>("openai");
  const [connectionHealth, setConnectionHealth] =
    useState<ConnectionHealth | null>(null);
  const [sent, setSent] = useState<string[]>([]);
  const [include, setInclude] = useState({
    plan: true,
    tasks: true,
    answers: false,
    reflections: false,
  });
  useEffect(() => {
    let active = true;
    jsonRequest<Status>("/api/ai/settings")
      .then((value) => active && setStatus(value))
      .catch((reason) => active && setError(reason.message));
    return () => {
      active = false;
    };
  }, []);
  const counts = useMemo(
    () => ({
      plan: Object.values(state.plan).filter((value) => value.trim()).length,
      tasks: state.tasks.filter((task) => !task.archived).length,
      answers: Object.values(state.answers).filter((value) => value.trim())
        .length,
      reflections: state.reflections.length,
    }),
    [state],
  );
  const hasShareable = (Object.keys(include) as (keyof typeof include)[]).some(
    (key) => include[key] && counts[key] > 0,
  );
  const selectedContext = useMemo<AiContext>(() => {
    const context: AiContext = {};
    if (include.plan && counts.plan) context.plan = state.plan;
    if (include.tasks && counts.tasks) {
      const day = state.days[date] ?? emptyDay();
      context.tasks = state.tasks
        .filter((task) => !task.archived)
        .map((task) => ({
          title: task.title,
          completedToday: day.completed.includes(task.id),
        }));
    }
    if (include.answers && counts.answers)
      context.answers = Object.fromEntries(
        prompts
          .filter(([id]) => state.answers[id]?.trim())
          .map(([id, question]) => [question, state.answers[id]]),
      );
    if (include.reflections && counts.reflections)
      context.reflections = state.reflections.slice(-20);
    return context;
  }, [counts, date, include, state]);
  const connect = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    const data = new FormData(form);
    try {
      const next = await jsonRequest<Status>("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: data.get("apiKey"),
          model: data.get("model"),
          provider: data.get("provider"),
          baseUrl: data.get("baseUrl"),
        }),
      });
      setStatus(next);
      setConnectionHealth(next.health ?? "working");
      form.reset();
    } catch (reason) {
      setConnectionHealth("down");
      setError(reason instanceof Error ? reason.message : "Connection failed.");
    } finally {
      setBusy(false);
    }
  };
  const disconnect = async () => {
    setBusy(true);
    setError("");
    try {
      await jsonRequest("/api/ai/settings", { method: "DELETE" });
      setStatus({ connected: false, model: null, provider: null });
      setConnectionHealth(null);
      setAnalysis(null);
      setChat([]);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not disconnect.",
      );
    } finally {
      setBusy(false);
    }
  };
  const analyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const context = selectedContext;
    try {
      const result = await jsonRequest<{ analysis: AiAnalysis }>(
        "/api/ai/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context, focus: data.get("focus") }),
        },
      );
      setAnalysis(result.analysis);
      setSent(Object.keys(context));
      setChat([]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  };
  const continueConversation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = new FormData(form).get("message");
    if (typeof message !== "string" || !message.trim()) return;
    const previous = chat;
    const messages = [...previous, { role: "user" as const, content: message.trim() }];
    setBusy(true);
    setError("");
    setChat(messages);
    try {
      const result = await jsonRequest<{ reply: string }>("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, context: selectedContext }),
      });
      setChat([...messages, { role: "assistant", content: result.reply }]);
      form.reset();
    } catch (reason) {
      setChat(previous);
      setError(reason instanceof Error ? reason.message : "Conversation failed.");
    } finally {
      setBusy(false);
    }
  };
  const addStep = (title: string) => {
    const exists = state.tasks.some(
      (task) =>
        !task.archived &&
        task.title.toLocaleLowerCase() === title.toLocaleLowerCase(),
    );
    if (!exists)
      update((current) => ({
        ...current,
        tasks: [
          ...current.tasks,
          { id: crypto.randomUUID(), title, time: "", archived: false },
        ],
      }));
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{ac.eyebrow}</span>
          <h1>
            {ac.title}<span className="heading-dot">.</span>
          </h1>
          <p>{ac.lead}</p>
        </div>
        {status?.connected && (
          <div className="ai-heading-status">
            <span className="tag">
              <ShieldCheck size={14} />
              Connected · {status.provider ? AI_PROVIDER_INFO[status.provider].label : "AI"} · {status.model}
            </span>
            <ConnectionIndicator
              health={connectionHealth ?? status.health ?? "working"}
              latencyMs={status.latencyMs}
              labels={{ working: ac.working, slow: ac.slow, down: ac.down }}
            />
          </div>
        )}
      </div>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      {!status ? (
        <section className="card ai-empty">
          <RefreshCw className="spin" size={24} />
          <p>{ac.checking}</p>
        </section>
      ) : !status.connected ? (
        <div className="ai-onboarding">
          <section className="card ai-intro">
            <span className="ai-orb">
              <Sparkles size={26} />
            </span>
            <span className="eyebrow">{ac.introEyebrow}</span>
            <h2>{ac.introTitle}</h2>
            <p>{ac.introLead}</p>
            <div className="privacy-points">
              <span>
                <Check size={16} />
                {ac.privacy1}
              </span>
              <span>
                <Check size={16} />
                {ac.privacy2}
              </span>
              <span>
                <Check size={16} />
                {ac.privacy3}
              </span>
            </div>
          </section>
          <section className="card ai-connect">
            <div className="section-heading">
              <div>
                <h2>{ac.connectTitle}</h2>
                <p>{ac.connectLead}</p>
              </div>
              <KeyRound size={22} />
            </div>
            <form onSubmit={connect} autoComplete="off">
              <label htmlFor="ai-provider">{ac.provider}</label>
              <select
                id="ai-provider"
                name="provider"
                value={provider}
                onChange={(event) => setProvider(event.target.value as AiProvider)}
              >
                {AI_PROVIDERS.map((value) => (
                  <option value={value} key={value}>{AI_PROVIDER_INFO[value].label}</option>
                ))}
              </select>
              {provider === "custom" && (
                <>
                  <label htmlFor="ai-base-url">{ac.baseUrl}</label>
                  <input id="ai-base-url" name="baseUrl" type="url" required placeholder="https://api.example.com/v1" />
                </>
              )}
              <label htmlFor="ai-key">{ac.apiKey}</label>
              <input
                id="ai-key"
                name="apiKey"
                type="password"
                required
                maxLength={300}
                minLength={8}
                placeholder={provider === "nvidia" ? "nvapi-…" : "Paste your provider key"}
                autoComplete="new-password"
              />
              <label htmlFor="ai-model">{ac.model}</label>
              <input
                id="ai-model"
                name="model"
                required
                maxLength={150}
                key={provider}
                defaultValue={AI_PROVIDER_INFO[provider].defaultModel}
                list={`ai-models-${provider}`}
                placeholder="Provider model ID"
              />
              <datalist id={`ai-models-${provider}`}>
                {AI_PROVIDER_INFO[provider].models.map((model) => <option value={model} key={model} />)}
              </datalist>
              {AI_PROVIDER_INFO[provider].note && (
                <p className="provider-note">{AI_PROVIDER_INFO[provider].note}</p>
              )}
              <p className="key-note">
                <LockKeyhole size={15} />
                {ac.keyNote}
              </p>
              <button className="button primary" disabled={busy}>
                {busy ? (
                  <>
                    <RefreshCw className="spin" size={16} />
                    {ac.checkingBtn}
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    {ac.connectBtn}
                  </>
                )}
              </button>
              {connectionHealth === "down" && (
                <ConnectionIndicator
                  health="down"
                  labels={{ working: ac.working, slow: ac.slow, down: ac.down }}
                />
              )}
            </form>
          </section>
        </div>
      ) : (
        <div className="ai-workspace">
          <section className="card ai-controls">
            <div className="section-heading">
              <div>
                <h2>{ac.chooseShare}</h2>
                <p>{ac.chooseShareLead}</p>
              </div>
              <Bot size={23} />
            </div>
            <div className="context-options">
              {(
                [
                  ["plan", ac.ctxPlan, counts.plan, ac.ctxPlanDesc],
                  ["tasks", ac.ctxTasks, counts.tasks, ac.ctxTasksDesc],
                  ["answers", ac.ctxAnswers, counts.answers, ac.ctxAnswersDesc],
                  [
                    "reflections",
                    ac.ctxJournal,
                    counts.reflections,
                    ac.ctxJournalDesc,
                  ],
                ] as const
              ).map(([key, label, count, description]) => (
                <label className="context-option" key={key}>
                  <input
                    type="checkbox"
                    checked={include[key]}
                    onChange={() =>
                      setInclude((value) => ({ ...value, [key]: !value[key] }))
                    }
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>
                      {description} · {ac.available(count)}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <form onSubmit={analyze}>
              <label htmlFor="ai-focus">
                {ac.focusLabel}{" "}
                <span className="muted">{ac.focusOptional}</span>
              </label>
              <textarea
                id="ai-focus"
                name="focus"
                rows={3}
                maxLength={1000}
                placeholder={ac.focusPlaceholder}
              />
              {!hasShareable && (
                <p className="privacy-note">{ac.needContent}</p>
              )}
              <div className="ai-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={disconnect}
                  disabled={busy}
                >
                  <Link2Off size={16} />
                  {ac.disconnect}
                </button>
                <button
                  className="button primary"
                  disabled={busy || !hasShareable}
                >
                  {busy ? (
                    <>
                      <RefreshCw className="spin" size={16} />
                      {ac.thinking}
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {ac.analyze}
                    </>
                  )}
                </button>
              </div>
            </form>
            <p className="key-note">
              <LockKeyhole size={15} />
              {ac.sendNote}
            </p>
          </section>
          {analysis ? (
            <section className="ai-results" aria-live="polite">
              <article className="card ai-summary">
                <span className="eyebrow">{ac.tentativeRead}</span>
                <h2>{analysis.summary}</h2>
                {analysis.patterns.length > 0 && (
                  <ul>
                    {analysis.patterns.map((pattern) => (
                      <li key={pattern}>{pattern}</li>
                    ))}
                  </ul>
                )}
                <small>
                  {ac.basedOn} {sent.join(", ")}.
                </small>
              </article>
              <div className="recommendation-grid">
                {analysis.recommendations.map((recommendation, index) => (
                  <article
                    className="card recommendation"
                    key={`${recommendation.title}-${index}`}
                  >
                    <span
                      className={`recommendation-area ${recommendation.area}`}
                    >
                      {recommendation.area}
                    </span>
                    <Lightbulb size={20} />
                    <h3>{recommendation.title}</h3>
                    <p>{recommendation.reason}</p>
                    <div className="suggested-step">
                      <span className="tiny-label">{ac.smallStep}</span>
                      <strong>{recommendation.nextStep}</strong>
                    </div>
                    <button
                      className="button secondary"
                      onClick={() => addStep(recommendation.nextStep)}
                    >
                      <Plus size={16} />
                      {ac.addToday}
                    </button>
                  </article>
                ))}
              </div>
              <article className="gentle-note ai-question">
                <span className="note-flower" aria-hidden="true">
                  ?
                </span>
                <div>
                  <span className="tiny-label">{ac.oneQuestion}</span>
                  <p>{analysis.question}</p>
                </div>
              </article>
              <section className="card ai-chat" aria-label="Continue the conversation">
                <div className="section-heading">
                  <div>
                    <h2>{ac.talkTitle}</h2>
                    <p>{ac.talkLead}</p>
                  </div>
                  <Bot size={22} />
                </div>
                {chat.length > 0 && (
                  <div className="ai-chat-messages" aria-live="polite">
                    {chat.map((message, index) => (
                      <p className={`ai-chat-message ${message.role}`} key={`${message.role}-${index}`}>
                        <strong>{message.role === "user" ? ac.you : ac.ai}</strong>
                        {message.content}
                      </p>
                    ))}
                  </div>
                )}
                <form onSubmit={continueConversation} className="ai-chat-form">
                  <label htmlFor="ai-message">{ac.followUp}</label>
                  <textarea
                    id="ai-message"
                    name="message"
                    rows={3}
                    maxLength={2000}
                    placeholder={ac.followUpPlaceholder}
                    disabled={busy}
                  />
                  <button className="button primary" disabled={busy}>
                    {busy ? <><RefreshCw className="spin" size={16} /> {ac.thinking}</> : <><Send size={16} /> {ac.sendMessage}</>}
                  </button>
                </form>
              </section>
            </section>
          ) : (
            <section className="card ai-empty">
              <span className="ai-orb">
                <Sparkles size={24} />
              </span>
              <h2>{ac.emptyTitle}</h2>
              <p>{ac.emptyLead}</p>
            </section>
          )}
        </div>
      )}
    </>
  );
}
