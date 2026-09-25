"use client";
import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Award,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Dialog } from "./Dialog";
import {
  calculateAssessment,
  displayArchetype,
  getAssessmentQuestions,
} from "@/lib/assessment";
import { update } from "@/lib/store";
import type { AssessmentProfile } from "@/lib/domain";
import { useLanguage } from "@/lib/language";
import { workspaceCopy } from "@/lib/locale/workspace";
import {
  MASLOW_TIER_LABELS,
  maslowOrientationLabel,
} from "@/lib/maslow";

export function BaselineAssessmentModal({
  currentProfile,
  onClose,
  onComplete,
}: {
  currentProfile?: AssessmentProfile | null;
  onClose: () => void;
  onComplete: (profile: AssessmentProfile) => void;
}) {
  const { locale } = useLanguage();
  const copy = workspaceCopy(locale);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AssessmentProfile | null>(
    currentProfile || null,
  );

  const questions = getAssessmentQuestions(locale);
  const question = questions[index];
  const isLast = index === questions.length - 1;
  const progressPercent = Math.round(((index + 1) / questions.length) * 100);
  const display =
    result ? displayArchetype(result, locale) : null;

  const selectOption = (optId: string) => {
    const nextAnswers = { ...answers, [question.id]: optId };
    setAnswers(nextAnswers);

    if (isLast) {
      const calculated = calculateAssessment(nextAnswers);
      update((s) => ({ ...s, assessmentProfile: calculated }));
      setResult(calculated);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const title = result
    ? locale === "ar"
      ? "اكتمل خط الأساس"
      : "Baseline complete"
    : locale === "ar"
      ? "تقييم خط الأساس"
      : "Baseline assessment";

  return (
    <Dialog title={title} onClose={onClose}>
      {result ? (
        <div className="assessment-results">
          <p className="assessment-disclaimer">{copy.assessmentDisclaimer}</p>
          <div className="archetype-banner">
            <div className="archetype-icon">
              <Award size={36} />
            </div>
            <div>
              <span className="eyebrow">
                {locale === "ar" ? "نمطك التعليمي" : "YOUR REFLECTION PROFILE"}
              </span>
              <h3>{display?.name ?? result.archetypeName}</h3>
              <p>{display?.description ?? result.motiveDescription}</p>
            </div>
          </div>

          <div className="framework-metrics-grid">
            <div className="metric-chip">
              <span className="metric-label">Hartman Core Motive</span>
              <strong className={`motive-tag motive-${result.coreMotive}`}>
                {result.coreMotive.toUpperCase()}
              </strong>
            </div>

            <div className="metric-chip">
              <span className="metric-label">DISC Execution Pace</span>
              <strong>Style {result.discStyle}</strong>
            </div>

            <div className="metric-chip">
              <span className="metric-label">Birkman Primary Need</span>
              <strong>{result.primaryNeed.toUpperCase()}</strong>
            </div>

            <div className="metric-chip">
              <span className="metric-label">Consciousness Baseline</span>
              <strong>Level {result.consciousnessLevel}+</strong>
            </div>

            {result.maslowCenter && (
              <div className="metric-chip">
                <span className="metric-label">{copy.maslowCenterLabel}</span>
                <strong>
                  {MASLOW_TIER_LABELS[result.maslowCenter][locale]}
                </strong>
                {result.maslowOrientation && (
                  <small>
                    {maslowOrientationLabel(result.maslowOrientation, locale)}
                  </small>
                )}
              </div>
            )}
          </div>

          <div className="assessment-benefit-callout">
            <Zap size={18} />
            <p>
              {locale === "ar" ? (
                <>
                  <strong>تأمل أسرع:</strong> أسئلة الصباح والمساء تعرض خيارات
                  قابلة للنقر مُعايرة لنمطك. كتابتك الشخصية تبقى اختيارية.
                </>
              ) : (
                <>
                  <strong>Faster reflection:</strong> Morning and evening prompts
                  offer tap choices aligned with your profile. Personal writing
                  stays optional.
                </>
              )}
            </p>
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setResult(null);
                setIndex(0);
                setAnswers({});
              }}
            >
              <RotateCcw size={16} />
              {locale === "ar" ? "إعادة" : "Retake"}
            </button>
            <button
              type="button"
              className="button primary"
              onClick={() => {
                onComplete(result);
                onClose();
              }}
            >
              {locale === "ar" ? "بدء التأمل" : "Begin tailored reflection"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="assessment-flow">
          <p className="assessment-disclaimer">{copy.assessmentDisclaimer}</p>
          <div className="assessment-meta-bar">
            <div>
              <span className="eyebrow">{question.framework}</span>
              <span className="tag">
                {locale === "ar"
                  ? `خطوة ${index + 1} من ${questions.length}`
                  : `Step ${index + 1} of ${questions.length}`}
              </span>
            </div>
            <span className="progress-fraction">{progressPercent}%</span>
          </div>

          <div className="progress-track">
            <span style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="assessment-prompt">
            <h3>{question.title}</h3>
            <p>{question.subtitle}</p>
          </div>

          <div className="assessment-options-list">
            {question.options.map((opt) => {
              const selected = answers[question.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`assessment-option-card ${selected ? "selected" : ""}`}
                  onClick={() => selectOption(opt.id)}
                >
                  <div className="option-head">
                    <span className="option-tag">{opt.tag}</span>
                    {selected && <Check size={18} className="option-check" />}
                  </div>
                  <strong>{opt.text}</strong>
                  <p>{opt.description}</p>
                </button>
              );
            })}
          </div>

          <div className="dialog-actions between">
            <button
              type="button"
              className="button secondary"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ArrowLeft size={16} /> {locale === "ar" ? "السابق" : "Previous"}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                if (isLast) {
                  const calculated = calculateAssessment(answers);
                  update((s) => ({ ...s, assessmentProfile: calculated }));
                  setResult(calculated);
                } else {
                  setIndex((i) => i + 1);
                }
              }}
            >
              {locale === "ar" ? "تخطّ السؤال" : "Skip question"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
