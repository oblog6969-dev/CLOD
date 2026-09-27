"use client";
import { useMemo } from "react";
import { ChartLine } from "lucide-react";
import type { State } from "@/lib/domain";
import { historyConclusions, summarizeHistory } from "@/lib/history";
import { useLanguage } from "@/lib/language";

export function HistoryCard({ state, date }: { state: State; date: string }) {
  const { locale, tr } = useLanguage();
  const summary = useMemo(() => summarizeHistory(state, date), [state, date]);
  const conclusions = historyConclusions(summary, locale);
  return (
    <section className="card history-card" aria-labelledby="history-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{tr("PATTERNS, NOT VERDICTS", "أنماط لا أحكام")}</span>
          <h2 id="history-title">{tr("What your history shows", "ما يكشفه سجلّك")}</h2>
          <p>
            {tr(
              "Computed on this device from your last four weeks. The AI guide can use these numbers if you let it.",
              "تُحسب على هذا الجهاز من آخر أربعة أسابيع. يمكن لدليل الذكاء الاصطناعي استخدام هذه الأرقام إن سمحت له.",
            )}
          </p>
        </div>
        <ChartLine size={23} />
      </div>
      <ul className="history-conclusions">
        {conclusions.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {summary.trackedDays >= 7 && (
        <dl className="history-stats">
          <div>
            <dt>{tr("Active days", "أيام النشاط")}</dt>
            <dd>
              {summary.activeDays}/{summary.windowDays}
            </dd>
          </div>
          <div>
            <dt>{tr("Longest run", "أطول سلسلة")}</dt>
            <dd>{summary.longestStreak}</dd>
          </div>
          <div>
            <dt>{tr("Plan revisions", "مراجعات الخطة")}</dt>
            <dd>{summary.planRevisions}</dd>
          </div>
          <div>
            <dt>{tr("Baselines taken", "مرات خط الأساس")}</dt>
            <dd>{summary.assessmentRuns}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
