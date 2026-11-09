import { useLanguage } from "../i18n/LanguageContext.jsx";
import React, { useState, useRef, useEffect } from "react";
import SiteLayout from "../components/SiteLayout.jsx";
import {
  HEALTH_OPTIONS,
  calculateBmi,
  validateContact,
} from "../lib/assessment.js";
import { sendSubmission } from "../lib/submission.js";
function AssessmentPage() {
  const { t: tr, formatBmi } = useLanguage();
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
    (submissionStatus === "submitted" ||
      submissionStatus === "dispatched" ||
      submissionStatus === "unknown") &&
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
      submissionStatus === "dispatched" ||
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
            <p className="eyebrow">
              {tr("Initial assessment · BMI calculator")}
            </p>
            <h1 id="assessment-title">
              {tr("Is my BMI in the range for weight-loss injections?")}
            </h1>
            <p>
              {tr(
                "Enter your height and weight and, if you wish, tell us about any health conditions. Your result is based on your body mass index (BMI).",
              )}
            </p>
            <ol className="steps" aria-label={tr("Assessment steps")}>
              <li aria-current={result ? undefined : "step"}>
                <span aria-hidden="true">1</span>
                {tr(" Your details")}
              </li>
              <li aria-current={result ? "step" : undefined}>
                <span aria-hidden="true">2</span>
                {tr(" Your result and follow-up")}
              </li>
            </ol>
            <p className="clinical-note">
              {tr(
                "BMI is one assessment factor. A doctor will also review your health history and circumstances before deciding about medication. ",
              )}
              <a
                href="https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr("Medical source")}
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
                    {tr("Height")}
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
                      {tr("cm")}
                    </span>
                  </div>
                  <p
                    className="field-error"
                    id="height-error"
                    hidden={!measurementErrors.height}
                  >
                    {tr(measurementErrors.height)}
                  </p>
                </div>
                <div className="field">
                  <label className="label" htmlFor="weight">
                    {tr("Weight")}
                  </label>
                  <div className="input-wrap">
                    <input
                      className="input"
                      id="weight"
                      name="weight"
                      inputMode="decimal"
                      placeholder={tr("84.5")}
                      required={true}
                      maxLength={12}
                      aria-invalid={!!measurementErrors.weight}
                      aria-describedby="weight-error"
                    />
                    <span className="unit" aria-hidden="true">
                      {tr("kg")}
                    </span>
                  </div>
                  <p
                    className="field-error"
                    id="weight-error"
                    hidden={!measurementErrors.weight}
                  >
                    {tr(measurementErrors.weight)}
                  </p>
                </div>
              </div>
              <fieldset>
                <legend>
                  {tr("Health conditions ")}
                  <span className="optional">{tr("(optional)")}</span>
                </legend>
                <div className="choices">
                  {HEALTH_OPTIONS.map((n) => (
                    <label className="choice" key={n}>
                      <input type="checkbox" name="health" value={n} /> {tr(n)}
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
                    {tr(" Other")}
                  </label>
                </div>
                {showOtherCondition && (
                  <div className="field health-note">
                    <label className="label" htmlFor="health-detail">
                      {tr("Other ")}
                      <span className="optional">{tr("(optional)")}</span>
                    </label>
                    <textarea
                      id="health-detail"
                      name="healthDetail"
                      maxLength={250}
                      rows={2}
                      placeholder={tr("Add a brief note if you would like.")}
                    />
                  </div>
                )}
              </fieldset>
              <div className="form-actions">
                <button className="button" type="submit">
                  {tr("Calculate and see my result")}
                </button>
              </div>
            </form>
            {result && (
              <section aria-labelledby="result-title">
                <h3 id="result-title" tabIndex={-1} ref={resultHeadingRef}>
                  {tr("Your initial assessment")}
                </h3>
                <div className="result-box" data-pass={String(result.inRange)}>
                  <div className="result-metric">
                    {tr("Your body mass index ")}
                    <strong
                      className={result.bmi > 30 ? "bmi-high" : undefined}
                    >
                      {formatBmi(result)}
                    </strong>
                  </div>
                  <p id="result-message">
                    {result.inRange
                      ? tr(
                          "Your BMI meets the threshold for an initial assessment for weight-loss injections.",
                        )
                      : tr(
                          "With a BMI below 30, you are outside this initial assessment range for weight-loss injections.",
                        )}
                  </p>
                  <p id="result-context">{tr(resultContext)}</p>
                  {result.hasHealthContext && (
                    <p id="health-context">
                      {tr(
                        "Tell your doctor about the health conditions you selected.",
                      )}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="text-button"
                  onClick={handleEdit}
                  disabled={isSending}
                >
                  {tr("Edit height, weight or health details")}
                </button>
                <div className="followup">
                  {submissionStatus === "submitted" ||
                  submissionStatus === "dispatched" ||
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
                        {submissionStatus === "submitted"
                          ? tr("Your request has been sent to the Roxana team!")
                          : submissionStatus === "dispatched"
                            ? tr(
                                "Your request has been sent from your browser.",
                              )
                            : tr("Delivery could not be confirmed.")}
                      </h3>
                      <p>
                        {submissionStatus === "submitted"
                          ? tr(" We will be in touch soon.")
                          : submissionStatus === "dispatched"
                            ? tr(
                                "Delivery has not been confirmed. Please contact the Roxana team if you need to follow up.",
                              )
                            : tr(
                                "Delivery could not be confirmed. Please contact the Roxana team before sending again.",
                              )}
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
                          ? tr("Want to lose weight with expert support?")
                          : tr("Would you like to talk to the Roxana team?")}
                      </h3>
                      <p className="form-intro">
                        {result.inRange
                          ? tr(
                              "Enter your name and preferred contact details so the Roxana team can arrange a consultation.",
                            )
                          : tr(
                              "If you would like to talk to the Roxana team, leave your name and one way to reach you.",
                            )}
                      </p>
                      <div className="field">
                        <label className="label" htmlFor="contact-name">
                          {tr("Name")}
                        </label>
                        <input
                          className="input"
                          id="contact-name"
                          name="name"
                          autoComplete="name"
                          placeholder={tr("Your name")}
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
                          {tr(contactErrors.name)}
                        </p>
                      </div>
                      <fieldset disabled={isSending}>
                        <legend>{tr("Preferred contact method")}</legend>
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
                            {tr(" Mobile number")}
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
                            {tr(" Instagram username")}
                          </label>
                        </div>
                      </fieldset>
                      <div className="field contact-field">
                        <label className="label" htmlFor="contact-value">
                          {isPhoneChannel
                            ? tr("Mobile number")
                            : tr("Instagram username")}
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
                            isPhoneChannel
                              ? tr("0912 345 6789")
                              : tr("@username")
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
                          {tr(contactErrors.contact)}
                        </p>
                      </div>
                      <div className="form-actions">
                        <button
                          className="button"
                          type="submit"
                          disabled={isSending}
                        >
                          {isSending ? tr("Sending…") : tr("Request a call")}
                        </button>
                      </div>
                      {submitError && (
                        <p className="field-error submit-error" role="alert">
                          {tr(submitError)}
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
