import React, { useState, useRef, useEffect } from "react";
import SiteLayout from "../components/SiteLayout.jsx";
import {
  HEALTH_OPTIONS,
  calculateBmi,
  validateContact,
} from "../lib/assessment.js";
import { sendSubmission } from "../lib/submission.js";
function AssessmentPage() {
  const [result, setResult] = useState(null);
  const [measurementErrors, setMeasurementErrors] = useState({});
  const [showOtherCondition, setShowOtherCondition] = useState(false);
  const [contactChannel, setContactChannel] = useState("phone");
  const [contactErrors, setContactErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const measurementsFormRef = useRef(null);
  const resultHeadingRef = useRef(null);
  const confirmationHeadingRef = useRef(null);
  const returnFocusRef = useRef(false);
  const sendingRef = useRef(false);
  useEffect(() => {
    result
      ? resultHeadingRef.current?.focus()
      : returnFocusRef.current &&
        ((returnFocusRef.current = false),
        measurementsFormRef.current?.elements.height.focus());
  }, [result]);
  useEffect(() => {
    (submissionStatus === "submitted" || submissionStatus === "unknown") &&
      confirmationHeadingRef.current?.focus();
  }, [submissionStatus]);
  function handleCalculate(n) {
    n.preventDefault();
    const b = n.currentTarget;
    const c = new FormData(b);
    const i = c.get("height");
    const o = c.get("weight");
    const p = calculateBmi(i, o);
    const r = {};
    p.invalidHeight &&
      (r.height =
        "Enter a height between 70 and 270 cm, with up to two decimal places.");
    p.invalidWeight &&
      (r.weight =
        "Enter a weight between 15 and 650 kg, with up to two decimal places.");
    setMeasurementErrors(r);
    const m = Object.keys(r)[0];
    if (m) {
      b.elements.namedItem(m)?.focus();
      return;
    }
    const d = c.getAll("health").map(String);
    const N = String(c.get("healthDetail") ?? "").trim();
    setResult({
      ...p,
      height: i,
      weight: o,
      health: d,
      healthDetail: N,
      hasHealthContext: d.length > 0 || !!N,
    });
  }
  function handleEdit() {
    returnFocusRef.current = true;
    setResult(null);
    setContactChannel("phone");
    setContactErrors({});
    setSubmitError("");
    setSubmissionStatus("idle");
  }
  async function handleContactSubmit(event) {
    event.preventDefault();
    if (
      sendingRef.current ||
      !result ||
      submissionStatus === "submitted" ||
      submissionStatus === "unknown"
    )
      return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const validated = validateContact(
      data.get("name"),
      contactChannel,
      data.get("contact"),
    );
    const errors = {};
    if (!validated.name) errors.name = "Enter your name using letters.";
    if (!validated.value)
      errors.contact =
        contactChannel === "phone"
          ? "Enter a valid mobile number, including your country code if outside Iran."
          : "Enter your Instagram username, for example @username.";
    setContactErrors(errors);
    setSubmitError("");
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      form.elements.namedItem(firstError)?.focus();
      return;
    }
    sendingRef.current = true;
    setSubmissionStatus("sending");
    try {
      const status = await sendSubmission("assessment", {
        reference: "RX-" + crypto.randomUUID(),
        name: validated.name,
        channel: contactChannel,
        contact: validated.value,
        height: result.height,
        weight: result.weight,
        health: result.health,
        healthDetail: result.healthDetail,
      });
      setSubmissionStatus(status);
    } catch (error) {
      setSubmitError(
        error.message || "Your request could not be sent. Please try again.",
      );
      setSubmissionStatus("idle");
    } finally {
      sendingRef.current = false;
    }
  }
  const isSending = submissionStatus === "sending";
  const isPhoneChannel = contactChannel === "phone";
  const resultContext = result?.inRange
    ? "A doctor must decide whether weight-loss injections and treatment are appropriate for you."
    : result?.bmi >= 27
      ? "At a BMI of 27 or above, a doctor may consider medication if certain weight-related conditions are present."
      : "If you have questions about managing your weight, talk to a doctor about suitable options.";
  return (
    <SiteLayout assessment={true}>
      <section
        className="assessment"
        id="assessment"
        aria-labelledby="assessment-title"
      >
        <div className="wrap assessment-grid">
          <div className="assessment-aside">
            <p className="eyebrow">Initial assessment · BMI calculator</p>
            <h1 id="assessment-title">
              Is my BMI in the range for weight-loss injections?
            </h1>
            <p>
              Enter your height and weight and, if you wish, tell us about any
              health conditions. Your result is based on your body mass index
              (BMI).
            </p>
            <ol className="steps" aria-label="Assessment steps">
              <li aria-current={result ? undefined : "step"}>
                <span aria-hidden="true">1</span>
                {" Your details"}
              </li>
              <li aria-current={result ? "step" : undefined}>
                <span aria-hidden="true">2</span>
                {" Your result and follow-up"}
              </li>
            </ol>
            <p className="clinical-note">
              {
                "BMI is one assessment factor. A doctor will also review your health history and circumstances before deciding about medication. "
              }
              <a
                href="https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity"
                target="_blank"
                rel="noopener noreferrer"
              >
                Medical source
              </a>
            </p>
          </div>
          <div className="form-card">
            <form
              ref={measurementsFormRef}
              onSubmit={handleCalculate}
              hidden={!!result}
              noValidate={true}
              autoComplete="off"
            >
              <div className="field-grid">
                <div className="field">
                  <label className="label" htmlFor="height">
                    Height
                  </label>
                  <div className="input-wrap">
                    <input
                      className="input"
                      id="height"
                      name="height"
                      inputMode="decimal"
                      placeholder="165"
                      required={true}
                      maxLength={12}
                      aria-invalid={!!measurementErrors.height}
                      aria-describedby="height-error"
                    />
                    <span className="unit" aria-hidden="true">
                      cm
                    </span>
                  </div>
                  <p
                    className="field-error"
                    id="height-error"
                    hidden={!measurementErrors.height}
                  >
                    {measurementErrors.height}
                  </p>
                </div>
                <div className="field">
                  <label className="label" htmlFor="weight">
                    Weight
                  </label>
                  <div className="input-wrap">
                    <input
                      className="input"
                      id="weight"
                      name="weight"
                      inputMode="decimal"
                      placeholder="84.5"
                      required={true}
                      maxLength={12}
                      aria-invalid={!!measurementErrors.weight}
                      aria-describedby="weight-error"
                    />
                    <span className="unit" aria-hidden="true">
                      kg
                    </span>
                  </div>
                  <p
                    className="field-error"
                    id="weight-error"
                    hidden={!measurementErrors.weight}
                  >
                    {measurementErrors.weight}
                  </p>
                </div>
              </div>
              <fieldset>
                <legend>
                  {"Health conditions "}
                  <span className="optional">(optional)</span>
                </legend>
                <div className="choices">
                  {HEALTH_OPTIONS.map((n) => (
                    <label className="choice" key={n}>
                      <input type="checkbox" name="health" value={n} /> {n}
                    </label>
                  ))}
                  <label className="choice">
                    <input
                      type="checkbox"
                      name="health"
                      value="other"
                      checked={showOtherCondition}
                      onChange={(n) => setShowOtherCondition(n.target.checked)}
                    />
                    {" Other"}
                  </label>
                </div>
                {showOtherCondition && (
                  <div className="field health-note">
                    <label className="label" htmlFor="health-detail">
                      {"Other "}
                      <span className="optional">(optional)</span>
                    </label>
                    <textarea
                      id="health-detail"
                      name="healthDetail"
                      maxLength={250}
                      rows={2}
                      placeholder="Add a brief note if you would like."
                    />
                  </div>
                )}
              </fieldset>
              <div className="form-actions">
                <button className="button" type="submit">
                  Calculate and see my result
                </button>
              </div>
            </form>
            {result && (
              <section aria-labelledby="result-title">
                <h3 id="result-title" tabIndex={-1} ref={resultHeadingRef}>
                  Your initial assessment
                </h3>
                <div className="result-box" data-pass={String(result.inRange)}>
                  <div className="result-metric">
                    {"Your body mass index "}
                    <strong
                      className={result.bmi > 30 ? "bmi-high" : undefined}
                    >
                      {result.display}
                    </strong>
                  </div>
                  <p id="result-message">
                    {result.inRange
                      ? "Your BMI meets the threshold for an initial assessment for weight-loss injections."
                      : "With a BMI below 30, you are outside this initial assessment range for weight-loss injections."}
                  </p>
                  <p id="result-context">{resultContext}</p>
                  {result.hasHealthContext && (
                    <p id="health-context">
                      Tell your doctor about the health conditions you selected.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="text-button"
                  onClick={handleEdit}
                  disabled={isSending}
                >
                  Edit height, weight or health details
                </button>
                <div className="followup">
                  {submissionStatus === "submitted" ||
                  submissionStatus === "unknown" ? (
                    <section
                      id="confirmation"
                      aria-labelledby="confirmation-title"
                    >
                      <h3
                        id="confirmation-title"
                        tabIndex={-1}
                        ref={confirmationHeadingRef}
                      >
                        Your request has been sent to the Roxana team!
                      </h3>
                      <p>
                        {submissionStatus === "submitted"
                          ? " We will be in touch soon."
                          : "Delivery could not be confirmed. Please contact the Roxana team before sending again."}
                      </p>
                    </section>
                  ) : (
                    <form
                      onSubmit={handleContactSubmit}
                      noValidate={true}
                      aria-busy={isSending}
                    >
                      <h3>
                        {result.inRange
                          ? "Want to lose weight with expert support?"
                          : "Would you like to talk to the Roxana team?"}
                      </h3>
                      <p className="form-intro">
                        {result.inRange
                          ? "Enter your name and preferred contact details so the Roxana team can arrange a consultation."
                          : "If you would like to talk to the Roxana team, leave your name and one way to reach you."}
                      </p>
                      <div className="field">
                        <label className="label" htmlFor="contact-name">
                          Name
                        </label>
                        <input
                          className="input"
                          id="contact-name"
                          name="name"
                          autoComplete="name"
                          placeholder="Your name"
                          required={true}
                          maxLength={80}
                          disabled={isSending}
                          aria-invalid={!!contactErrors.name}
                          aria-describedby="contact-name-error"
                        />
                        <p
                          className="field-error"
                          id="contact-name-error"
                          hidden={!contactErrors.name}
                        >
                          {contactErrors.name}
                        </p>
                      </div>
                      <fieldset disabled={isSending}>
                        <legend>Preferred contact method</legend>
                        <div className="choices">
                          <label className="choice">
                            <input
                              type="radio"
                              name="channel"
                              value="phone"
                              checked={isPhoneChannel}
                              onChange={() => {
                                setContactChannel("phone");
                                setContactErrors({});
                              }}
                            />
                            {" Mobile number"}
                          </label>
                          <label className="choice">
                            <input
                              type="radio"
                              name="channel"
                              value="instagram"
                              checked={!isPhoneChannel}
                              onChange={() => {
                                setContactChannel("instagram");
                                setContactErrors({});
                              }}
                            />
                            {" Instagram username"}
                          </label>
                        </div>
                      </fieldset>
                      <div className="field contact-field">
                        <label className="label" htmlFor="contact-value">
                          {isPhoneChannel
                            ? "Mobile number"
                            : "Instagram username"}
                        </label>
                        <input
                          className="input"
                          id="contact-value"
                          name="contact"
                          key={contactChannel}
                          dir="ltr"
                          maxLength={40}
                          required={true}
                          type={isPhoneChannel ? "tel" : "text"}
                          autoComplete={isPhoneChannel ? "tel" : "off"}
                          placeholder={
                            isPhoneChannel ? "0912 345 6789" : "@username"
                          }
                          disabled={isSending}
                          aria-invalid={!!contactErrors.contact}
                          aria-describedby="contact-value-error"
                        />
                        <p
                          className="field-error"
                          id="contact-value-error"
                          hidden={!contactErrors.contact}
                        >
                          {contactErrors.contact}
                        </p>
                      </div>
                      <div className="form-actions">
                        <button
                          className="button"
                          type="submit"
                          disabled={isSending}
                        >
                          {isSending ? "Sending…" : "Request a call"}
                        </button>
                      </div>
                      {submitError && (
                        <p className="field-error submit-error" role="alert">
                          {submitError}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
export default AssessmentPage;
