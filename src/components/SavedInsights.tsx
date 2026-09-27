"use client";
import { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import {
  editInsight,
  removeInsight,
  type Insight,
  type InsightRecommendation,
  type State,
} from "@/lib/domain";
import { update } from "@/lib/store";
import { useLanguage } from "@/lib/language";
import { assistantCopy } from "@/lib/locale/assistant";

function InsightEditor({ insight, onDone }: { insight: Insight; onDone: () => void }) {
  const { locale } = useLanguage();
  const ac = assistantCopy(locale);
  const [recommendations, setRecommendations] = useState<InsightRecommendation[]>(
    insight.recommendations,
  );
  const setRec = (index: number, key: "title" | "nextStep", value: string) =>
    setRecommendations((list) => list.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  return (
    <form
      className="insight-editor"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const summary = String(data.get("summary") ?? "").trim();
        if (!summary) return;
        const saved = update((s) =>
          editInsight(s, insight.id, {
            summary,
            patterns: String(data.get("patterns") ?? "")
              .split("\n")
              .map((p) => p.trim())
              .filter(Boolean),
            recommendations: recommendations
              .map((r) => ({ ...r, title: r.title.trim(), nextStep: r.nextStep.trim() }))
              .filter((r) => r.title || r.nextStep),
            question: String(data.get("question") ?? "").trim(),
          }),
        );
        if (saved) onDone();
      }}
    >
      <label htmlFor={`insight-summary-${insight.id}`}>{ac.savedSummary}</label>
      <textarea
        id={`insight-summary-${insight.id}`}
        name="summary"
        required
        rows={3}
        maxLength={2000}
        defaultValue={insight.summary}
      />
      <label htmlFor={`insight-patterns-${insight.id}`}>
        {ac.savedPatterns} <span className="muted">{ac.savedPatternsHint}</span>
      </label>
      <textarea
        id={`insight-patterns-${insight.id}`}
        name="patterns"
        rows={4}
        maxLength={4000}
        defaultValue={insight.patterns.join("\n")}
      />
      {recommendations.length > 0 && (
        <fieldset className="insight-recs">
          <legend>{ac.savedRecommendations}</legend>
          {recommendations.map((r, i) => (
            <div key={i} className="insight-rec-row">
              <input
                aria-label={`${ac.savedRecommendations} ${i + 1}`}
                value={r.title}
                maxLength={300}
                onChange={(e) => setRec(i, "title", e.target.value)}
              />
              <input
                aria-label={`${ac.smallStep} ${i + 1}`}
                value={r.nextStep}
                maxLength={300}
                onChange={(e) => setRec(i, "nextStep", e.target.value)}
              />
            </div>
          ))}
        </fieldset>
      )}
      <label htmlFor={`insight-question-${insight.id}`}>{ac.savedQuestion}</label>
      <input
        id={`insight-question-${insight.id}`}
        name="question"
        maxLength={1000}
        defaultValue={insight.question}
      />
      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={onDone}>
          {ac.savedCancel}
        </button>
        <button className="button primary">
          <Check size={16} />
          {ac.savedSave}
        </button>
      </div>
    </form>
  );
}

export function SavedInsights({ state }: { state: State }) {
  const { locale, dateLocale } = useLanguage();
  const ac = assistantCopy(locale);
  const [editing, setEditing] = useState<string | null>(null);
  const insights = [...(state.insights ?? [])].reverse();
  return (
    <section className="card saved-insights" aria-labelledby="saved-insights-title">
      <div className="section-heading">
        <div>
          <h2 id="saved-insights-title">{ac.savedTitle}</h2>
          <p>{ac.savedLead}</p>
        </div>
      </div>
      {!insights.length && <p className="muted">{ac.savedEmpty}</p>}
      {insights.map((insight) => (
        <article className="saved-insight" key={insight.id}>
          <div className="saved-insight-meta">
            <span className="tiny-label">
              {new Date(insight.createdAt).toLocaleString(dateLocale, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            {insight.edited && <span className="tag">{ac.savedEdited}</span>}
          </div>
          {editing === insight.id ? (
            <InsightEditor insight={insight} onDone={() => setEditing(null)} />
          ) : (
            <>
              {insight.focus && (
                <p className="muted">
                  {ac.savedFocus} {insight.focus}
                </p>
              )}
              <h3>{insight.summary}</h3>
              {insight.patterns.length > 0 && (
                <ul>
                  {insight.patterns.map((pattern, i) => (
                    <li key={i}>{pattern}</li>
                  ))}
                </ul>
              )}
              {insight.recommendations.length > 0 && (
                <ul className="saved-insight-recs">
                  {insight.recommendations.map((r, i) => (
                    <li key={i}>
                      <strong>{r.title}</strong>
                      {r.nextStep && <> · {r.nextStep}</>}
                    </li>
                  ))}
                </ul>
              )}
              {insight.question && <p className="saved-insight-question">{insight.question}</p>}
              <div className="settings-buttons">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setEditing(insight.id)}
                  aria-label={`${ac.savedEdit}: ${insight.summary}`}
                >
                  <Pencil size={15} />
                  {ac.savedEdit}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  aria-label={`${ac.savedDelete}: ${insight.summary}`}
                  onClick={() => {
                    if (window.confirm(ac.savedConfirmDelete))
                      update((s) => removeInsight(s, insight.id));
                  }}
                >
                  <Trash2 size={15} />
                  {ac.savedDelete}
                </button>
              </div>
            </>
          )}
        </article>
      ))}
    </section>
  );
}
