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
  type AiContext,
  type AiProvider,
} from "@/lib/ai";
import { emptyDay, prompts, type State } from "@/lib/domain";
import { update } from "@/lib/store";

type Status = { connected: boolean; model: string | null; provider: AiProvider | null };
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
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [provider, setProvider] = useState<AiProvider>("openai");
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
  const connect = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
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
      event.currentTarget.reset();
    } catch (reason) {
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
      setAnalysis(null);
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
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Analysis failed.");
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
          <span className="eyebrow">OPTIONAL GUIDANCE, ON YOUR TERMS</span>
          <h1>
            AI guide<span className="heading-dot">.</span>
          </h1>
          <p>
            Look for patterns and turn them into small, reviewable suggestions.
          </p>
        </div>
        {status?.connected && (
          <span className="tag">
            <ShieldCheck size={14} />
            Connected · {status.provider ? AI_PROVIDER_INFO[status.provider].label : "AI"} · {status.model}
          </span>
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
          <p>Checking your AI connection…</p>
        </section>
      ) : !status.connected ? (
        <div className="ai-onboarding">
          <section className="card ai-intro">
            <span className="ai-orb">
              <Sparkles size={26} />
            </span>
            <span className="eyebrow">A SECOND SET OF EYES</span>
            <h2>Thoughtful suggestions, only when you ask.</h2>
            <p>
              The guide can compare your direction, daily actions, and any
              reflections you choose to share. Its output is a draft. You decide
              what belongs in your life.
            </p>
            <div className="privacy-points">
              <span>
                <Check size={16} />
                Nothing is sent automatically
              </span>
              <span>
                <Check size={16} />
                You choose each category
              </span>
              <span>
                <Check size={16} />
                Suggestions never change your plan
              </span>
            </div>
          </section>
          <section className="card ai-connect">
            <div className="section-heading">
              <div>
                <h2>Connect your AI provider</h2>
                <p>OpenAI, DeepSeek, NVIDIA NIM, or another compatible API.</p>
              </div>
              <KeyRound size={22} />
            </div>
            <form onSubmit={connect} autoComplete="off">
              <label htmlFor="ai-provider">Provider</label>
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
                  <label htmlFor="ai-base-url">API base URL</label>
                  <input id="ai-base-url" name="baseUrl" type="url" required placeholder="https://api.example.com/v1" />
                </>
              )}
              <label htmlFor="ai-key">API key</label>
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
              <label htmlFor="ai-model">Model</label>
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
              <p className="key-note">
                <LockKeyhole size={15} />
                The key is validated server-side and placed in an encrypted,
                HttpOnly session cookie. It is excluded from browser storage and
                backups. Reconnect after the server restarts.
              </p>
              <button className="button primary" disabled={busy}>
                {busy ? (
                  <>
                    <RefreshCw className="spin" size={16} />
                    Checking…
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    Connect securely
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      ) : (
        <div className="ai-workspace">
          <section className="card ai-controls">
            <div className="section-heading">
              <div>
                <h2>Choose what to share</h2>
                <p>Only selected content is sent when you press Analyze.</p>
              </div>
              <Bot size={23} />
            </div>
            <div className="context-options">
              {(
                [
                  ["plan", "My direction", counts.plan, "Your six plan fields"],
                  [
                    "tasks",
                    "Daily steps",
                    counts.tasks,
                    "Active tasks and today’s completion",
                  ],
                  [
                    "answers",
                    "Reset answers",
                    counts.answers,
                    "Your private guided-reflection answers",
                  ],
                  [
                    "reflections",
                    "Journal reflections",
                    counts.reflections,
                    "Up to the 20 most recent notes",
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
                      {description} · {count} available
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <form onSubmit={analyze}>
              <label htmlFor="ai-focus">
                What would you like help with?{" "}
                <span className="muted">(optional)</span>
              </label>
              <textarea
                id="ai-focus"
                name="focus"
                rows={3}
                maxLength={1000}
                placeholder="For example: Help me make this month realistic, or spot where my actions don’t match my direction."
              />
              {!hasShareable && (
                <p className="privacy-note">
                  Add a daily step, direction, reset answer, or reflection
                  before requesting analysis.
                </p>
              )}
              <div className="ai-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={disconnect}
                  disabled={busy}
                >
                  <Link2Off size={16} />
                  Disconnect key
                </button>
                <button
                  className="button primary"
                  disabled={busy || !hasShareable}
                >
                  {busy ? (
                    <>
                      <RefreshCw className="spin" size={16} />
                      Thinking…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Analyze selected context
                    </>
                  )}
                </button>
              </div>
            </form>
            <p className="key-note">
              <LockKeyhole size={15} />
              Selected text is sent to {status.provider ? AI_PROVIDER_INFO[status.provider].label : "your provider"} for this request. LifeOS does not save the analysis. Your provider’s data controls and charges apply.
            </p>
          </section>
          {analysis ? (
            <section className="ai-results" aria-live="polite">
              <article className="card ai-summary">
                <span className="eyebrow">A TENTATIVE READ</span>
                <h2>{analysis.summary}</h2>
                {analysis.patterns.length > 0 && (
                  <ul>
                    {analysis.patterns.map((pattern) => (
                      <li key={pattern}>{pattern}</li>
                    ))}
                  </ul>
                )}
                <small>
                  Based on: {sent.join(", ")}. Review this against your own
                  experience.
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
                      <span className="tiny-label">A SMALL NEXT STEP</span>
                      <strong>{recommendation.nextStep}</strong>
                    </div>
                    <button
                      className="button secondary"
                      onClick={() => addStep(recommendation.nextStep)}
                    >
                      <Plus size={16} />
                      Add to Today
                    </button>
                  </article>
                ))}
              </div>
              <article className="gentle-note ai-question">
                <span className="note-flower" aria-hidden="true">
                  ?
                </span>
                <div>
                  <span className="tiny-label">ONE QUESTION TO KEEP</span>
                  <p>{analysis.question}</p>
                </div>
              </article>
            </section>
          ) : (
            <section className="card ai-empty">
              <span className="ai-orb">
                <Sparkles size={24} />
              </span>
              <h2>Your words come first.</h2>
              <p>
                Select the context you’re comfortable sharing, then ask for a
                fresh perspective.
              </p>
            </section>
          )}
        </div>
      )}
    </>
  );
}
