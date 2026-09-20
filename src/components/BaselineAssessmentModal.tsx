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
  assessmentQuestions,
  calculateAssessment,
} from "@/lib/assessment";
import { update } from "@/lib/store";
import type { AssessmentProfile } from "@/lib/domain";

export function BaselineAssessmentModal({
  currentProfile,
  onClose,
  onComplete,
}: {
  currentProfile?: AssessmentProfile | null;
  onClose: () => void;
  onComplete: (profile: AssessmentProfile) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AssessmentProfile | null>(
    currentProfile || null,
  );

  const question = assessmentQuestions[index];
  const isLast = index === assessmentQuestions.length - 1;
  const progressPercent = Math.round(
    ((index + 1) / assessmentQuestions.length) * 100,
  );

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

  return (
    <Dialog
      title={result ? "Psychometric Calibration Complete" : "Baseline Assessment"}
      onClose={onClose}
    >
      {result ? (
        <div className="assessment-results">
          <div className="archetype-banner">
            <div className="archetype-icon">
              <Award size={36} />
            </div>
            <div>
              <span className="eyebrow">YOUR HUMAN DEVELOPMENT ARCHETYPE</span>
              <h3>{result.archetypeName}</h3>
              <p>{result.motiveDescription}</p>
            </div>
          </div>

          <div className="framework-metrics-grid">
            <div className="metric-chip">
              <span className="metric-label">Hartman Core Motive</span>
              <strong className={`motive-tag motive-${result.coreMotive}`}>
                {result.coreMotive.toUpperCase()}
              </strong>
              <small>
                {result.coreMotive === "red" && "Power & Results"}
                {result.coreMotive === "blue" && "Intimacy & Purpose"}
                {result.coreMotive === "white" && "Peace & Clarity"}
                {result.coreMotive === "yellow" && "Fun & Vitality"}
              </small>
            </div>

            <div className="metric-chip">
              <span className="metric-label">DISC Execution Pace</span>
              <strong>Style {result.discStyle}</strong>
              <small>
                {result.discStyle === "D" && "Fast & Decisive"}
                {result.discStyle === "I" && "Dynamic & Inspiring"}
                {result.discStyle === "S" && "Grounded & Steady"}
                {result.discStyle === "C" && "Methodical & Analytical"}
              </small>
            </div>

            <div className="metric-chip">
              <span className="metric-label">Birkman Primary Need</span>
              <strong>{result.primaryNeed.toUpperCase()}</strong>
              <small>Guards against burnout</small>
            </div>

            <div className="metric-chip">
              <span className="metric-label">Consciousness Baseline</span>
              <strong>Level {result.consciousnessLevel}+</strong>
              <small>Hawkins Generative Power</small>
            </div>
          </div>

          <div className="assessment-benefit-callout">
            <Zap size={18} />
            <p>
              <strong>Daily Reflection Supercharged:</strong> Your morning & evening
              prompts will now offer instant, psychologically calibrated choices
              attuned to this archetype. No more typing out manual essays every
              day!
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
              Retake
            </button>
            <button
              type="button"
              className="button primary"
              onClick={() => {
                onComplete(result);
                onClose();
              }}
            >
              Begin Tailored Reflection <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="assessment-flow">
          <div className="assessment-meta-bar">
            <div>
              <span className="eyebrow">{question.framework}</span>
              <span className="tag">
                Step {index + 1} of {assessmentQuestions.length}
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
              <ArrowLeft size={16} /> Previous
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
              Skip question <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
