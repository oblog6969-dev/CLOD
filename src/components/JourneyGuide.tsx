"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Compass } from "lucide-react";
import {
  getJourneyGuide,
  journeySteps,
  type GuideAction,
  type View,
} from "@/lib/journey";
import type { State } from "@/lib/domain";
import { useLanguage } from "@/lib/language";

export function JourneyGuide({
  view,
  state,
  date,
  onNavigate,
  onAction,
}: {
  view: View;
  state: State;
  date: string;
  onNavigate: (view: View) => void;
  onAction: (action: GuideAction) => void;
}) {
  const { tr, locale } = useLanguage();
  const guide = getJourneyGuide(view, state, date, locale);
  const [expanded, setExpanded] = useState(guide.isNew);
  const welcome = view === "today" && guide.isNew;
  return (
    <section
      className={`journey-guide${welcome ? " journey-welcome" : ""}`}
      aria-label={tr("Your journey guide")}
    >
      <div className="journey-heading">
        <span className="journey-symbol">
          <Compass size={22} aria-hidden="true" />
        </span>
        <div>
          <span className="eyebrow">
            {welcome ? tr("WELCOME TO LIFEOS") : tr("A LITTLE GUIDANCE")}
          </span>
          <h2>
            {welcome
              ? tr("A starting point, even if you don’t have a plan.")
              : tr(guide.title)}
          </h2>
        </div>
      </div>
      <p className="journey-intro">
        {welcome
          ? tr("LifeOS helps you explore what you want to change, choose a direction, and practice it through small daily actions. We’ll explain each step as you go. No background reading needed.")
          : tr(guide.why)}
      </p>
      <div className="journey-next">
        <div>
          <strong>{tr("Suggested next step")}</strong>
          <p>{tr(guide.next.reason)}</p>
        </div>
        <button
          type="button"
          className="button primary"
          onClick={() => onAction(guide.next.action)}
        >
          {tr(guide.next.label)}
          <ArrowRight size={16} className="rtl-flip" aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        className="journey-expand"
        aria-expanded={expanded}
        aria-controls="journey-details"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? tr("Hide the walkthrough") : tr("Show the walkthrough")}
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <div id="journey-details" hidden={!expanded}>
        <nav aria-label={tr("Journey steps")}>
          <ol className="journey-steps">
            {journeySteps.map((step, index) => (
              <li key={step.view}>
                <button
                  type="button"
                  aria-label={`${tr("Go to", "انتقل إلى")} ${tr(step.destination)}`}
                  aria-current={view === step.view ? "step" : undefined}
                  onClick={() => onNavigate(step.view)}
                >
                  <span className="journey-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <strong>{tr(step.title)}</strong>
                  <span>{tr(step.description)}</span>
                  <small>{guide.statuses[index]}</small>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <p className="journey-tip">
          <strong>{tr("Try this:")}</strong> {tr(guide.tip)}
        </p>
        <p className="journey-footnote">
          {tr("Move at your own pace. You can visit any section and revise your answers. AI guide is optional; Settings & data holds your backups.")}
        </p>
        <details className="journey-source">
          <summary>{tr("Where this journey comes from")}</summary>
          <p>
            {tr("LifeOS adapts Dan Koe’s reflection-to-action approach. The guidance here helps you use the app; your answers and decisions stay yours. Reading the original is optional.", "يكيّف لايف أو إس منهج دان كو من التأمل إلى الفعل. يساعدك هذا الإرشاد على استخدام التطبيق، وتبقى إجاباتك وقراراتك ملكك. قراءة المصدر الأصلي اختيارية.")}
          </p>
          <a
            href="https://x.com/thedankoe/article/2010751592346030461"
            target="_blank"
            rel="noreferrer"
          >
            {tr("Read the original article")}
          </a>
        </details>
      </div>
    </section>
  );
}
