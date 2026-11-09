import { useLanguage } from "../i18n/LanguageContext.jsx";
import React, { useState, useEffect, useRef } from "react";
import { sitePath } from "../lib/paths.js";
import SiteFooter from "../components/SiteFooter.jsx";
import LanguageSwitch from "../components/LanguageSwitch.jsx";
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
function formatAnswer(a, s, l, tr) {
  if (a.id === "photos") {
    const r = PHOTO_VIEWS.filter((n) => l[n.id]).map((n) => tr(n.label));
    return [
      tr(s.photos || "Not answered"),
      r.length
        ? tr("Attached photos: {views}", {
            views: r.join(", "),
          })
        : tr("No photos attached"),
    ].join(" · ");
  }
  const value = String(s[a.id] || "").trim();
  return a.type === "choice" ? tr(value) : value;
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
  const { t: tr } = useLanguage();
  const [s, l] = useState("");
  useEffect(() => {
    const r = URL.createObjectURL(a);
    l(r);
    return () => URL.revokeObjectURL(r);
  }, [a]);
  return s ? <img src={s} alt={tr("Preview of your selected photo")} /> : null;
}
function AnswerReview({ answers: a, photos: s, onEdit: l }) {
  const { t: tr } = useLanguage();
  return (
    <div className="q-review">
      {SECTIONS.map((r, n) => (
        <section className="q-review-section" key={r.short}>
          <div className="q-review-heading">
            <h3>{tr(r.title)}</h3>
            {l && (
              <button
                type="button"
                className="q-text-button"
                onClick={() => l(n)}
              >
                {tr("Edit ")}
                <span className="q-sr-only">{tr(r.short)}</span>
              </button>
            )}
          </div>
          <dl>
            {QUESTIONS.filter((m) => m.section === n).map((m) => (
              <div key={m.id}>
                <dt>
                  {formatNumber(m.number)}
                  {". "}
                  {tr(m.label)}
                </dt>
                <dd dir="auto">{formatAnswer(m, a, s, tr)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
function QuestionnairePage() {
  const { t: tr } = useLanguage();
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
    submissionStatus === "submitted" ||
    submissionStatus === "dispatched" ||
    submissionStatus === "unknown";
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
          {
            onProgress: (sent, total) => setSendProgress([sent, total]),
          },
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
        <span>{tr(t.label)}</span>
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
                  <span>{tr(i)}</span>
                </label>
              ))}
            </div>
            {t.type === "photos" && u === t.options[0] && (
              <div className="q-photo-area">
                <p className="q-hint">
                  {tr(
                    "Add whichever photos you wish: JPG or PNG, up to 5 MB each.",
                  )}
                </p>
                <div className="q-photos">
                  {PHOTO_VIEWS.map((i) => (
                    <div className="q-photo" key={i.id}>
                      <label
                        className="q-photo-label"
                        htmlFor={`photo-${i.id}`}
                      >
                        {tr(i.label)} <span>{tr("(optional)")}</span>
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
                            {tr("Remove photo ")}
                            <span className="q-sr-only">{tr(i.label)}</span>
                          </button>
                        </React.Fragment>
                      )}
                      <p
                        className="q-error"
                        id={`photo-${i.id}-error`}
                        role={photoErrors[i.id] ? "alert" : undefined}
                      >
                        {tr(photoErrors[i.id])}
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
                placeholder={tr("Write your answer here…")}
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
                  placeholder={tr(t.placeholder)}
                  dir={t.id === "contact" ? "ltr" : "ltr"}
                />
                {tr(t.unit) && <span className="q-unit">{tr(t.unit)}</span>}
              </div>
            )}
          </React.Fragment>
        )}
        <p className="q-hint" id={`${c}-hint`}>
          {tr(t.hint)}
        </p>
        <p className="q-error" id={`${c}-error`}>
          {tr(errors[t.id])}
        </p>
      </div>
    );
  }
  return (
    <div className="q-page">
      <a className="q-skip" href="#questionnaire">
        {tr("Skip to questionnaire")}
      </a>
      <header className="q-header">
        <div className="q-container q-header-inner">
          <a
            className="q-brand"
            href={sitePath("/")}
            aria-label={tr("Roxana home")}
          >
            <img src={sitePath("/roxana-logo.png")} alt="" />
            <span>
              {tr("Roxana")}
              <small>{tr("By your side, for a better you")}</small>
            </span>
          </a>
          <div className="q-header-controls">
            <span className="q-header-label">
              {tr("Getting started questionnaire")}
            </span>
            <LanguageSwitch />
          </div>
        </div>
      </header>
      <main className="q-container q-layout" id="questionnaire">
        <aside className="q-aside">
          <p className="q-eyebrow">
            <span />
            {tr(" A fresh start, just for you")}
          </p>
          <h1>
            {tr("Your plan")}
            <br />
            {tr(" starts with ")}
            <em>{tr("knowing you.")}</em>
            <br className="q-desktop-break" />
            {""}
          </h1>
          <p className="q-lead">
            {tr(
              "Take a few minutes for yourself. Tell us about your goals, your body and your habits so we can start your journey with a better understanding of you.",
            )}
          </p>
          <div className="q-aside-note">
            <span className="q-note-icon" dir="ltr" aria-hidden="true">
              {"}"}
            </span>
            <p>
              {tr("There are no right or wrong answers;")}
              <br />
              {tr("just be yourself and write freely.")}
            </p>
          </div>
          <div className="q-meta">
            <span>{tr("23 questions")}</span>
            <span>{tr("Only the first section is required")}</span>
          </div>
          <p className="q-aside-footer">{tr("Small steps. Lasting change.")}</p>
        </aside>
        <div className="q-panel">
          {isComplete ? (
            <section className="q-completion" aria-labelledby="q-title">
              <div className="q-completion-icon" aria-hidden="true">
                {submissionStatus === "submitted" ||
                submissionStatus === "dispatched"
                  ? "✓"
                  : "…"}
              </div>
              <p className="q-eyebrow">
                {tr("Thank you for sharing your story")}
              </p>
              <h2 id="q-title" ref={headingRef} tabIndex={-1}>
                {submissionStatus === "submitted"
                  ? tr("Your questionnaire has been sent.")
                  : submissionStatus === "dispatched"
                    ? tr("Your questionnaire has been sent from your browser.")
                    : tr("Delivery could not be confirmed.")}
              </h2>
              <p>
                {submissionStatus === "submitted"
                  ? tr(
                      "Your answers and selected photos have been sent to the Roxana team. Keep your reference below if you need to follow up.",
                    )
                  : submissionStatus === "dispatched"
                    ? tr(
                        "Your browser sent your answers and selected photos. Delivery has not been confirmed. Keep your reference below if you need to follow up.",
                      )
                    : tr(
                        "We could not confirm delivery. Contact the Roxana team with your reference before sending again.",
                      )}
              </p>
              <p className="q-reference">
                {tr("Your reference: ")}
                <bdi>{reference}</bdi>
              </p>
              <details className="q-sent-answers">
                <summary>{tr("View my answers")}</summary>
                <AnswerReview answers={answers} photos={photos} />
              </details>
            </section>
          ) : (
            <React.Fragment>
              <nav className="q-stepper" aria-label={tr("Questionnaire steps")}>
                <ol>
                  {[
                    ...SECTIONS.map((t) => tr(t.short)),
                    tr("Review & send"),
                  ].map((t, c) => (
                    <li
                      key={t}
                      aria-current={currentSection === c ? "step" : undefined}
                      data-done={currentSection > c}
                    >
                      <span className="q-step-dot" aria-hidden="true">
                        {currentSection > c ? "✓" : formatNumber(c + 1)}
                      </span>
                      <span>{tr(t)}</span>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="q-progress-row">
                <span>
                  {isReview
                    ? tr("One last look before you send")
                    : tr("Step {step} of 4", {
                        step: formatNumber(currentSection + 1),
                      })}
                </span>
                <span>
                  {tr("{count} of 23 answered", {
                    count: formatNumber(answeredCount),
                  })}
                </span>
              </div>
              <div
                className="q-progress"
                role="progressbar"
                aria-label={tr("Questions answered")}
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
                    ? tr("Does everything look right?")
                    : tr(SECTIONS[currentSection].title)}
                </h2>
                <p>
                  {isReview
                    ? tr(
                        "Review your answers. You can go back and edit any section.",
                      )
                    : tr(SECTIONS[currentSection].description)}
                  {!isReview &&
                    currentSection > 0 &&
                    tr(
                      " All questions in this section are optional; you can leave them blank and continue.",
                    )}
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
                      ? tr("Review your answers")
                      : tr(SECTIONS[currentSection].title)
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
                    {tr(
                      "Please complete the highlighted questions to continue.",
                    )}
                  </p>
                )}
                {isReview && (
                  <p className="q-send-note">
                    {tr(
                      "When you send, your answers and selected photos will be shared with the Roxana team.",
                    )}
                  </p>
                )}
                <div className="q-actions">
                  <button
                    className="q-button"
                    type="submit"
                    disabled={isSending}
                  >
                    {isSending
                      ? tr("Sending…")
                      : isReview
                        ? tr("Send questionnaire")
                        : tr("Let's continue")}
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
                      {tr("Previous step")}
                    </button>
                  )}
                </div>
                {isSending && (
                  <p className="q-hint q-status" role="status">
                    {tr(
                      "Sending your answers and photos. Please keep this page open.",
                    )}
                    {sendProgress[1] > 0
                      ? " (" +
                        tr("{sent} of {total}", {
                          sent: formatNumber(sendProgress[0]),
                          total: formatNumber(sendProgress[1]),
                        }) +
                        ")"
                      : ""}
                  </p>
                )}
                {submitError && (
                  <p className="q-error q-error-summary" role="alert">
                    {tr(submitError)}
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
