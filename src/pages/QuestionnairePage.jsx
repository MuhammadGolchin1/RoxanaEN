import React, { useState, useEffect, useRef } from "react";
import SiteFooter from "../components/SiteFooter.jsx";
import { parseMeasurement, validateContact } from "../lib/assessment.js";
import { sendSubmission } from "../lib/submission.js";
const SECTIONS = [
  {
    title: "Let's get to know you",
    short: "About you",
    description: "Tell us a little about yourself.",
  },
  {
    title: "Your goals and your health",
    short: "Goals & health",
    description:
      "Your answers help us understand your circumstances and what your body needs.",
  },
  {
    title: "Exercise in your everyday life",
    short: "Exercise",
    description:
      "A plan that fits your time and equipment is easier to stick with.",
  },
  {
    title: "Your food preferences and habits",
    short: "Nutrition",
    description: "Tell us about the foods you enjoy and your eating habits.",
  },
];
const PHOTO_VIEWS = [
  {
    id: "front",
    label: "Front",
  },
  {
    id: "side",
    label: "Side",
  },
  {
    id: "back",
    label: "Back",
  },
];
const QUESTIONS = [
  {
    id: "name",
    section: 0,
    label: "What would you like us to call you?",
    type: "text",
    maxLength: 80,
    autoComplete: "name",
    placeholder: "e.g. Roxana",
  },
  {
    id: "age",
    section: 0,
    label: "How old are you?",
    type: "number",
    maxLength: 3,
    placeholder: "e.g. 32",
    unit: "years",
  },
  {
    id: "gender",
    section: 0,
    label: "What is your gender?",
    type: "choice",
    options: ["Woman", "Man", "Other", "Prefer not to say"],
  },
  {
    id: "height",
    section: 0,
    label: "How tall are you?",
    type: "number",
    maxLength: 12,
    placeholder: "e.g. 165",
    unit: "cm",
  },
  {
    id: "weight",
    section: 0,
    label: "How much do you weigh?",
    type: "number",
    maxLength: 12,
    placeholder: "e.g. 70.5",
    unit: "kg",
  },
  {
    id: "contact",
    section: 0,
    label: "Share an Instagram username or mobile number so we can reach you.",
    type: "text",
    maxLength: 40,
    placeholder: "+44 7700 900123 or @username",
    hint: "Just one is enough: a mobile number or Instagram username.",
  },
  {
    id: "occupation",
    section: 1,
    label: "What do you do for work, and how active are you during the day?",
  },
  {
    id: "goal",
    section: 1,
    label: "What would you like to achieve during this program?",
  },
  {
    id: "conditions",
    section: 1,
    label: "Do you have any medical conditions we should know about?",
    hint: "If not, write 'None'.",
  },
  {
    id: "medications",
    section: 1,
    label: "Are you currently taking any medication?",
    hint: "If so, include the name and dosage. Otherwise, write 'No'.",
  },
  {
    id: "pain",
    section: 1,
    label: "Do you have any joint, muscle or bone pain?",
  },
  {
    id: "injuries",
    section: 1,
    label: "Have you ever had a sports injury or surgery?",
  },
  {
    id: "sleep",
    section: 1,
    label: "How many hours do you usually sleep, and how well do you sleep?",
  },
  {
    id: "photos",
    section: 1,
    label:
      "Would you like to add three photos — front, side and back — in fitted sportswear for a closer posture assessment? (optional)",
    type: "photos",
    optional: true,
    options: ["I'll add photos now", "I'll send them later", "I'd rather not"],
  },
  {
    id: "experience",
    section: 2,
    label: "What is your exercise experience so far?",
  },
  {
    id: "location",
    section: 2,
    label: "Where would you prefer to exercise — at home or at the gym?",
    type: "choice",
    options: ["At home", "Gym", "Both"],
  },
  {
    id: "availability",
    section: 2,
    label:
      "How many days a week can you exercise, and how much time can you spend each day?",
  },
  {
    id: "equipment",
    section: 2,
    label: "If you will exercise at home, what equipment do you have?",
    hint: "If you have no equipment or train at the gym, just let us know.",
  },
  {
    id: "allergies",
    section: 3,
    label: "Do you have any food allergies or intolerances?",
  },
  {
    id: "dislikes",
    section: 3,
    label: "Which foods do you dislike and prefer to leave out of your plan?",
  },
  {
    id: "favorites",
    section: 3,
    label:
      "Which traditional or home-cooked dishes do you enjoy and want to keep in your plan?",
  },
  {
    id: "supplements",
    section: 3,
    label: "Are you currently taking any sports supplements or vitamins?",
  },
  {
    id: "habits",
    section: 3,
    label: "Are there any eating habits you would like us to know about?",
  },
].map((a, s) => ({
  type: "textarea",
  maxLength: 1800,
  ...a,
  optional: a.section !== 0,
  number: s + 1,
}));
const normalizeDigits = (a) =>
  a.replace(/[۰-۹٠-٩]/g, (s) => String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(s) % 10));
function validateAnswers(a, s) {
  const l = {};
  for (const r of QUESTIONS.filter((n) => s === undefined || n.section === s)) {
    const n = String(a[r.id] || "").trim();
    !n && !r.optional
      ? (l[r.id] = "Please answer this question.")
      : n.length > r.maxLength
        ? (l[r.id] =
            `Please shorten your answer to no more than ${r.maxLength} characters.`)
        : r.options && n && !r.options.includes(n)
          ? (l[r.id] = "Please choose one of the options.")
          : r.id === "age" &&
              (!/^\d{1,3}$/.test(normalizeDigits(n)) ||
                +normalizeDigits(n) < 1 ||
                +normalizeDigits(n) > 120)
            ? (l.age = "Enter an age between 1 and 120 years.")
            : r.id === "height" && parseMeasurement(n, 70, 270) === null
              ? (l.height = "Enter a height between 70 and 270 cm.")
              : r.id === "weight" && parseMeasurement(n, 15, 650) === null
                ? (l.weight = "Enter a weight between 15 and 650 kg.")
                : r.id === "contact" &&
                  !validateContact("Name", "phone", n).value &&
                  !validateContact("Name", "instagram", n).value &&
                  (l.contact =
                    "Enter a valid mobile number or Instagram username.");
  }
  return l;
}
function validatePhoto(a) {
  return a
    ? ["image/jpeg", "image/png"].includes(a.type)
      ? !a.size || a.size > 5 * 1024 * 1024
        ? "Each photo must be larger than zero and no more than 5 MB."
        : ""
      : "Choose a JPG or PNG image."
    : "";
}
function formatAnswer(a, s, l) {
  if (a.id === "photos") {
    const r = PHOTO_VIEWS.filter((n) => l[n.id]).map((n) => n.label);
    return [
      s.photos || "Not answered",
      r.length ? `Attached photos: ${r.join(", ")}` : "No photos attached",
    ].join(" · ");
  }
  return String(s[a.id] || "").trim();
}
const formatNumber = (a) =>
  new Intl.NumberFormat("en-US", {
    useGrouping: false,
  }).format(a);
function ArrowIcon({ back: a = false }) {
  return (
    <svg
      className={a ? "q-arrow q-arrow-back" : "q-arrow"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M19 12H5m6-6-6 6 6 6" />
    </svg>
  );
}
function PhotoPreview({ file: a }) {
  const [s, l] = useState("");
  useEffect(() => {
    const r = URL.createObjectURL(a);
    l(r);
    return () => URL.revokeObjectURL(r);
  }, [a]);
  return s ? <img src={s} alt="Preview of your selected photo" /> : null;
}
function AnswerReview({ answers: a, photos: s, onEdit: l }) {
  return (
    <div className="q-review">
      {SECTIONS.map((r, n) => (
        <section className="q-review-section" key={r.short}>
          <div className="q-review-heading">
            <h3>{r.title}</h3>
            {l && (
              <button
                type="button"
                className="q-text-button"
                onClick={() => l(n)}
              >
                {"Edit "}
                <span className="q-sr-only">{r.short}</span>
              </button>
            )}
          </div>
          <dl>
            {QUESTIONS.filter((m) => m.section === n).map((m) => (
              <div key={m.id}>
                <dt>
                  {formatNumber(m.number)}
                  {". "}
                  {m.label}
                </dt>
                <dd dir="auto">{formatAnswer(m, a, s)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
function QuestionnairePage() {
  const [answers, setAnswers] = useState({});
  const [photos, setPhotos] = useState({});
  const [photoErrors, setPhotoErrors] = useState({});
  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const [sendProgress, setSendProgress] = useState([0, 0]);
  const [reference, setReference] = useState("");
  const sendingRef = useRef(false);
  const headingRef = useRef(null);
  const shouldFocusHeadingRef = useRef(false);
  const fieldToFocusRef = useRef(null);
  const isComplete =
    submissionStatus === "submitted" || submissionStatus === "unknown";
  const isSending = submissionStatus === "sending";
  const isReview = currentSection === SECTIONS.length;
  const answeredCount = QUESTIONS.filter((t) =>
    String(answers[t.id] || "").trim(),
  ).length;
  const sectionQuestions = QUESTIONS.filter(
    (t) => t.section === currentSection,
  );
  useEffect(() => {
    (shouldFocusHeadingRef.current || isComplete) &&
      (headingRef.current?.focus({
        preventScroll: true,
      }),
      headingRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      }));
  }, [currentSection, isComplete]);
  useEffect(() => {
    const t = fieldToFocusRef.current;
    fieldToFocusRef.current = null;
    t && document.getElementById(`q-${t}`)?.focus();
  }, [errors, currentSection]);
  useEffect(() => {
    if (!answeredCount || isComplete) return;
    const t = (c) => {
      c.preventDefault();
      c.returnValue = "";
    };
    window.addEventListener("beforeunload", t);
    return () => window.removeEventListener("beforeunload", t);
  }, [answeredCount, isComplete]);
  function updateAnswer(t, c) {
    setAnswers((u) => ({
      ...u,
      [t]: c,
    }));
    setErrors((u) => {
      const h = {
        ...u,
      };
      delete h[t];
      return h;
    });
    t === "photos" &&
      c !== QUESTIONS.find((u) => u.id === "photos").options[0] &&
      (setPhotos({}), setPhotoErrors({}));
  }
  function handlePhotoChange(t, c) {
    const u = c.target.files?.[0];
    if (!u) return;
    const h = validatePhoto(u);
    if (
      (setPhotoErrors((E) => ({
        ...E,
        [t]: h,
      })),
      h)
    ) {
      c.target.value = "";
      return;
    }
    setPhotos((E) => ({
      ...E,
      [t]: u,
    }));
  }
  function goToSection(t) {
    shouldFocusHeadingRef.current = true;
    setCurrentSection(t);
    setErrors({});
    setSubmitError("");
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (sendingRef.current || isComplete) return;
    const errors = validateAnswers(
      answers,
      isReview ? undefined : currentSection,
    );
    setErrors(errors);
    if (Object.keys(errors).length) {
      const first = QUESTIONS.find((question) => errors[question.id]);
      fieldToFocusRef.current = first.id;
      shouldFocusHeadingRef.current = true;
      setCurrentSection(first.section);
      return;
    }
    if (!isReview) {
      goToSection(currentSection + 1);
      return;
    }
    sendingRef.current = true;
    setSubmissionStatus("sending");
    setSubmitError("");
    const reference = "RX-" + crypto.randomUUID();
    setReference(reference);
    try {
      setSubmissionStatus(
        await sendSubmission(
          "questionnaire",
          {
            reference,
            answers: answers,
          },
          photos,
        ),
      );
    } catch (error) {
      setSubmissionStatus("idle");
      setSubmitError(
        error.message ||
          "Your questionnaire could not be sent. Please try again.",
      );
    } finally {
      sendingRef.current = false;
    }
  }
  function renderQuestion(t) {
    const c = `q-${t.id}`;
    const u = answers[t.id] || "";
    const h = `${c}-hint ${c}-error`;
    const E = (
      <React.Fragment>
        <span className="q-number">
          {formatNumber(t.number).padStart(2, "0")}
        </span>
        <span>{t.label}</span>
      </React.Fragment>
    );
    const k = {
      id: c,
      name: t.id,
      value: u,
      required: !t.optional,
      maxLength: t.maxLength,
      "aria-invalid": !!errors[t.id],
      "aria-describedby": h,
      onChange: (i) => updateAnswer(t.id, i.target.value),
    };
    const ee = t.type === "choice" || t.type === "photos";
    return (
      <div className={`q-field q-field-${t.type}`} key={t.id}>
        {ee ? (
          <fieldset
            id={c}
            tabIndex={-1}
            aria-describedby={h}
            aria-invalid={!!errors[t.id]}
          >
            <legend className="q-label">{E}</legend>
            <div className="q-choices">
              {t.options.map((i) => (
                <label className="q-choice" key={i}>
                  <input
                    type="radio"
                    name={t.id}
                    value={i}
                    checked={u === i}
                    required={!t.optional}
                    onChange={() => updateAnswer(t.id, i)}
                  />
                  <span>{i}</span>
                </label>
              ))}
            </div>
            {t.type === "photos" && u === t.options[0] && (
              <div className="q-photo-area">
                <p className="q-hint">
                  Add whichever photos you wish: JPG or PNG, up to 5 MB each.
                </p>
                <div className="q-photos">
                  {PHOTO_VIEWS.map((i) => (
                    <div className="q-photo" key={i.id}>
                      <label
                        className="q-photo-label"
                        htmlFor={`photo-${i.id}`}
                      >
                        {i.label} <span>(optional)</span>
                      </label>
                      {photos[i.id] && <PhotoPreview file={photos[i.id]} />}
                      <input
                        id={`photo-${i.id}`}
                        type="file"
                        accept="image/jpeg,image/png"
                        aria-describedby={`photo-${i.id}-error`}
                        aria-invalid={!!photoErrors[i.id]}
                        onChange={(R) => handlePhotoChange(i.id, R)}
                      />
                      {photos[i.id] && (
                        <React.Fragment>
                          <p className="q-file-name" dir="auto">
                            {photos[i.id].name}
                          </p>
                          <button
                            className="q-text-button"
                            type="button"
                            onClick={() => {
                              setPhotos((R) => {
                                const O = {
                                  ...R,
                                };
                                delete O[i.id];
                                return O;
                              });
                              setPhotoErrors((R) => ({
                                ...R,
                                [i.id]: "",
                              }));
                              document.getElementById(`photo-${i.id}`).value =
                                "";
                            }}
                          >
                            {"Remove photo "}
                            <span className="q-sr-only">{i.label}</span>
                          </button>
                        </React.Fragment>
                      )}
                      <p
                        className="q-error"
                        id={`photo-${i.id}-error`}
                        role={photoErrors[i.id] ? "alert" : undefined}
                      >
                        {photoErrors[i.id]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </fieldset>
        ) : (
          <React.Fragment>
            <label className="q-label" htmlFor={c}>
              {E}
            </label>
            {t.type === "textarea" ? (
              <textarea
                {...k}
                rows={3}
                placeholder="Write your answer here…"
                dir="auto"
              />
            ) : (
              <div className="q-input-wrap">
                <input
                  {...k}
                  type="text"
                  inputMode={
                    t.type === "number"
                      ? t.id === "age"
                        ? "numeric"
                        : "decimal"
                      : "text"
                  }
                  autoComplete={t.autoComplete || "off"}
                  placeholder={t.placeholder}
                  dir={t.id === "contact" ? "ltr" : "ltr"}
                />
                {t.unit && <span className="q-unit">{t.unit}</span>}
              </div>
            )}
          </React.Fragment>
        )}
        <p className="q-hint" id={`${c}-hint`}>
          {t.hint}
        </p>
        <p className="q-error" id={`${c}-error`}>
          {errors[t.id]}
        </p>
      </div>
    );
  }
  return (
    <div className="q-page">
      <a className="q-skip" href="#questionnaire">
        Skip to questionnaire
      </a>
      <header className="q-header">
        <div className="q-container q-header-inner">
          <a className="q-brand" href="/" aria-label="Roxana home">
            <img src="/roxana-logo.png" alt="" />
            <span>
              Roxana<small>By your side, for a better you</small>
            </span>
          </a>
          <span className="q-header-label">Getting started questionnaire</span>
        </div>
      </header>
      <main className="q-container q-layout" id="questionnaire">
        <aside className="q-aside">
          <p className="q-eyebrow">
            <span />
            {" A fresh start, just for you"}
          </p>
          <h1>
            Your plan
            <br />
            {" starts with "}
            <em>knowing you.</em>
            <br className="q-desktop-break" />
            {""}
          </h1>
          <p className="q-lead">
            Take a few minutes for yourself. Tell us about your goals, your body
            and your habits so we can start your journey with a better
            understanding of you.
          </p>
          <div className="q-aside-note">
            <span className="q-note-icon" dir="ltr" aria-hidden="true">
              {"}"}
            </span>
            <p>
              There are no right or wrong answers;
              <br />
              just be yourself and write freely.
            </p>
          </div>
          <div className="q-meta">
            <span>23 questions</span>
            <span>Only the first section is required</span>
          </div>
          <p className="q-aside-footer">Small steps. Lasting change.</p>
        </aside>
        <div className="q-panel">
          {isComplete ? (
            <section className="q-completion" aria-labelledby="q-title">
              <div className="q-completion-icon" aria-hidden="true">
                {submissionStatus === "submitted" ? "✓" : "…"}
              </div>
              <p className="q-eyebrow">Thank you for sharing your story</p>
              <h2 id="q-title" ref={headingRef} tabIndex={-1}>
                {submissionStatus === "submitted"
                  ? "Your questionnaire has been sent."
                  : "Delivery could not be confirmed."}
              </h2>
              <p>
                {submissionStatus === "submitted"
                  ? "Your answers and selected photos have been sent to the Roxana team. Keep your reference below if you need to follow up."
                  : "We could not confirm delivery. Contact the Roxana team with your reference before sending again."}
              </p>
              <p className="q-reference">
                {"Your reference: "}
                <bdi>{reference}</bdi>
              </p>
              <details className="q-sent-answers">
                <summary>View my answers</summary>
                <AnswerReview answers={answers} photos={photos} />
              </details>
            </section>
          ) : (
            <React.Fragment>
              <nav className="q-stepper" aria-label="Questionnaire steps">
                <ol>
                  {[...SECTIONS.map((t) => t.short), "Review & send"].map(
                    (t, c) => (
                      <li
                        key={t}
                        aria-current={currentSection === c ? "step" : undefined}
                        data-done={currentSection > c}
                      >
                        <span className="q-step-dot" aria-hidden="true">
                          {currentSection > c ? "✓" : formatNumber(c + 1)}
                        </span>
                        <span>{t}</span>
                      </li>
                    ),
                  )}
                </ol>
              </nav>
              <div className="q-progress-row">
                <span>
                  {isReview
                    ? "One last look before you send"
                    : `Step ${formatNumber(currentSection + 1)} of 4`}
                </span>
                <span>
                  {formatNumber(answeredCount)}
                  {" of 23 answered"}
                </span>
              </div>
              <div
                className="q-progress"
                role="progressbar"
                aria-label="Questions answered"
                aria-valuemin={0}
                aria-valuemax={23}
                aria-valuenow={answeredCount}
              >
                <span
                  style={{
                    width: `${(answeredCount / 23) * 100}%`,
                  }}
                />
              </div>
              <div className="q-section-intro">
                <h2 id="q-title" ref={headingRef} tabIndex={-1}>
                  {isReview
                    ? "Does everything look right?"
                    : SECTIONS[currentSection].title}
                </h2>
                <p>
                  {isReview
                    ? "Review your answers. You can go back and edit any section."
                    : SECTIONS[currentSection].description}
                  {!isReview &&
                    currentSection > 0 &&
                    " All questions in this section are optional; you can leave them blank and continue."}
                </p>
              </div>
              <form
                onSubmit={handleSubmit}
                noValidate={true}
                aria-busy={isSending}
              >
                <fieldset
                  className="q-fields"
                  disabled={isSending}
                  aria-label={
                    isReview
                      ? "Review your answers"
                      : SECTIONS[currentSection].title
                  }
                >
                  {isReview ? (
                    <AnswerReview
                      answers={answers}
                      photos={photos}
                      onEdit={goToSection}
                    />
                  ) : (
                    sectionQuestions.map(renderQuestion)
                  )}
                </fieldset>
                {Object.keys(errors).length > 0 && (
                  <p className="q-error q-error-summary" role="alert">
                    Please complete the highlighted questions to continue.
                  </p>
                )}
                {isReview && (
                  <p className="q-send-note">
                    When you send, your answers and selected photos will be
                    shared with the Roxana team.
                  </p>
                )}
                <div className="q-actions">
                  <button
                    className="q-button"
                    type="submit"
                    disabled={isSending}
                  >
                    {isSending
                      ? "Sending…"
                      : isReview
                        ? "Send questionnaire"
                        : "Let's continue"}
                    {!isSending && <ArrowIcon />}
                  </button>
                  {currentSection > 0 && (
                    <button
                      className="q-back"
                      type="button"
                      disabled={isSending}
                      onClick={() => goToSection(currentSection - 1)}
                    >
                      <ArrowIcon back={true} />
                      Previous step
                    </button>
                  )}
                </div>
                {isSending && (
                  <p className="q-hint q-status" role="status">
                    Sending your answers and photos. Please keep this page open.
                    {sendProgress[1] > 0
                      ? ` (${formatNumber(sendProgress[0])} of ${formatNumber(sendProgress[1])})`
                      : ""}
                  </p>
                )}
                {submitError && (
                  <p className="q-error q-error-summary" role="alert">
                    {submitError}
                  </p>
                )}
              </form>
            </React.Fragment>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
export default QuestionnairePage;
