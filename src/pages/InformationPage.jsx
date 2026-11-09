import { useLanguage } from "../i18n/LanguageContext.jsx";
import React from "react";
import { sitePath } from "../lib/paths.js";
function buildFaqItems(tr) {
  return [
    {
      question: "How exactly does Roxana help with my fitness and health?",
      answer: (
        <p>
          {tr(
            "At Roxana, our aim is to build a healthy, lasting lifestyle that fits your body and everyday life, rather than a restrictive, short-term diet. You will have the support of a ",
          )}
          <strong>
            {tr(
              "team of doctors, nutrition specialists, exercise professionals and corrective exercise specialists",
            )}
          </strong>
          {tr(
            " who review your circumstances together and help you take an evidence-informed approach, through lifestyle changes and, where appropriate, medical care.",
          )}
        </p>
      ),
    },
    {
      question:
        "What is the difference between the two forms, and which should I complete?",
      answer: (
        <React.Fragment>
          <p>
            {tr(
              "There are two different ways to start, depending on what you are looking for:",
            )}
          </p>
          <ul>
            <li>
              <strong>
                <a href={sitePath("/assessment/")}>
                  {tr(
                    "Form one — BMI calculation and initial medication assessment:",
                  )}
                </a>
              </strong>
              {tr(
                " This form shows whether your BMI is within the site's initial assessment range for weight-loss medication. If you would like a medical review, leave your details to connect with our medical and nutrition team.",
              )}
            </li>
            <li>
              <strong>
                <a href={sitePath("/questionnaire/")}>
                  {tr(
                    "Form two — lifestyle assessment and a personalized plan, get fit by Nowruz:",
                  )}
                </a>
              </strong>
              {tr(
                " This form is separate from medication eligibility and BMI thresholds. It is for people who want to start ",
              )}
              <strong>
                {tr(
                  "Roxana coaching, a personalized meal plan and an individual exercise program",
                )}
              </strong>
              {tr(
                ". You will be asked about your lifestyle, food preferences, activity, weight and goals so the team can get to know you and discuss your next steps.",
              )}
            </li>
          </ul>
        </React.Fragment>
      ),
    },
    {
      question: "The calculator shows a BMI above 30. What happens next?",
      answer: (
        <React.Fragment>
          <p>
            {tr(
              "If your BMI is above 30 and you send us your details, we connect you with our ",
            )}
            <strong>{tr("doctors and nutrition specialists")}</strong>:
          </p>
          <ol>
            <li>
              <strong>{tr("Medical consultation and review:")}</strong>
              {tr(
                " A doctor first reviews your health, existing conditions and family history to assess whether weight-loss medication is appropriate for you.",
              )}
            </li>
            <li>
              <strong>{tr("If a doctor recommends medication:")}</strong>
              {tr(
                " If you are a suitable candidate, a doctor may prescribe treatment. ",
              )}
              <strong>{tr("At the same time,")}</strong>
              {tr(
                " our nutrition and exercise specialists develop a plan to support your nutrition, strength and longer-term weight management during treatment.",
              )}
            </li>
            <li>
              <strong>
                {tr(
                  "If medication is unsuitable, or you prefer not to use it:",
                )}
              </strong>
              {tr(
                " Medication is optional. If your doctor does not recommend it, or you prefer a different approach, you can work towards your goals with ",
              )}
              <strong>
                {tr("Roxana's personalized nutrition and exercise programs")}
              </strong>
              {tr(", supported by our nutrition and exercise specialists.")}
            </li>
          </ol>
        </React.Fragment>
      ),
    },
    {
      question: "Are Roxana programs only for weight loss and gym workouts?",
      answer: (
        <React.Fragment>
          <p>
            {tr(
              "No. Our nutrition and exercise plans are personalized to your goals and circumstances:",
            )}
          </p>
          <ul>
            <li>
              <strong>{tr("Choose where you train:")}</strong>
              {tr(" Whether you prefer to exercise at ")}
              <strong>{tr("home")}</strong>
              {tr(" with minimal equipment or at a ")}
              <strong>{tr("Gym")}</strong>
              {tr(
                ", your plan is designed around the option that works best for you.",
              )}
            </li>
            <li>
              <strong>{tr("Support for different goals:")}</strong>
              {tr(" Our nutrition and exercise programs support ")}
              <strong>{tr("weight loss and fat loss")}</strong>
              {", "}
              <strong>{tr("weight gain and muscle building")}</strong>
              {tr(", and ")}
              <strong>{tr("maintaining health and fitness")}</strong>.
            </li>
            <li>
              <strong>{tr("Specialist corrective exercise:")}</strong>
              {tr(
                " If you have posture concerns, joint pain or issues such as excessive lower-back arch, rounded shoulders or knee pain, our exercise specialists can incorporate a ",
              )}
              <strong>{tr("tailored corrective exercise plan")}</strong>
              {tr(
                " alongside your fitness program, taking your needs and limitations into account.",
              )}
            </li>
          </ul>
        </React.Fragment>
      ),
    },
    {
      question:
        "How do I receive my plan after completing the lifestyle assessment?",
      answer: (
        <p>
          {tr(
            "When you submit the second form, your lifestyle information, food preferences and physical circumstances are shared with the Roxana team. After an initial review, ",
          )}
          <strong>{tr("our advisers and specialist team contact you")}</strong>
          {tr(
            " to discuss the next steps, suitable packages and the details of your nutrition and exercise plans.",
          )}
        </p>
      ),
    },
  ];
}
function FaqContent() {
  const { t: tr } = useLanguage();
  const FAQ_ITEMS = buildFaqItems(tr);
  return (
    <div className="faq-list">
      {FAQ_ITEMS.map(({ question: l, answer: a }, n) => (
        <details className="faq-item" key={l}>
          <summary className="faq-question">
            <span className="faq-number" aria-hidden="true">
              {new Intl.NumberFormat("en-US").format(n + 1)}
            </span>
            <h2>{tr(l)}</h2>
            <svg
              className="faq-toggle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path className="faq-toggle__vertical" d="M12 5v14" />
            </svg>
          </summary>
          <div className="faq-answer">{a}</div>
        </details>
      ))}
    </div>
  );
}
function PrivacyContent() {
  const { t: tr } = useLanguage();
  return (
    <article className="privacy-policy" aria-labelledby="privacy-policy-title">
      <h2 id="privacy-policy-title">
        {tr("Your privacy — trusted to Roxana ")}
        <span aria-hidden="true">🔒🌿</span>
      </h2>
      <p className="privacy-policy__intro">
        {tr(
          "At Roxana, we understand that discussing your weight, health, eating habits and sharing body photos takes trust. The information you provide in our forms is treated as ",
        )}
        <strong>{tr("confidential")}</strong>
        {tr(
          ", with your privacy and peace of mind at the heart of our approach:",
        )}
      </p>
      <ul className="privacy-policy__sections">
        <li>
          <h3>{tr("Your information, for your health")}</h3>
          <p>
            {tr(
              "The information you share with Roxana, from your height, weight and medical history to your lifestyle and contact details, is used ",
            )}
            <strong>
              {tr(
                "solely to review your circumstances, provide health consultations and develop your personalized nutrition and exercise plan",
              )}
            </strong>
            {tr(
              ". It is not shared with unrelated individuals or organizations.",
            )}
          </p>
        </li>
        <li>
          <h3>{tr("Protecting your photos")}</h3>
          <p>
            {tr(
              "If you choose to share body photos during your assessment or corrective exercise review, ",
            )}
            <strong>{tr("your photos are treated as private")}</strong>
            {tr(
              ". Only the relevant specialist or coach reviews them, for assessing posture, muscular symmetry and your individual plan. They are never published, even as anonymous examples.",
            )}
          </p>
        </li>
        <li>
          <h3>{tr("Deleting photos after your program")}</h3>
          <p>
            {tr(
              "We do not keep a permanent archive of your personal photos. Once your program and work with Roxana have ended, ",
            )}
            <strong>
              {tr(
                "your submitted photos are permanently deleted from our servers and systems",
              )}
            </strong>
            {tr(", with no copies retained.")}
          </p>
        </li>
      </ul>
    </article>
  );
}
function AboutContent() {
  const { t: tr } = useLanguage();
  return (
    <div className="about-content">
      <div className="about-intro">
        <div className="about-intro__copy">
          <p className="eyebrow">
            {tr("Your smart companion on the path to health")}
          </p>
          <h2>{tr("Roxana — a smart companion, backed by specialists")}</h2>
          <p>
            {tr(
              "Roxana is an AI character and companion supported by a team of specialists. We bring expertise and technology together to make health, fitness, nutrition and lifestyle changes easier to approach and better suited to your needs.",
            )}
          </p>
        </div>
        <img
          className="about-intro__portrait"
          src={sitePath("/roxana-portrait-reference-botanical.png")}
          alt={tr(
            "Roxana, an AI character in turquoise sportswear with botanical details",
          )}
          width="1383"
          height="1137"
          decoding="async"
        />
      </div>
      <section className="about-section" aria-labelledby="about-team-title">
        <h2 id="about-team-title">{tr("The people behind Roxana")}</h2>
        <p>
          {tr(
            "Roxana is run by Maryam Boostani and Mohammad Golchin, a motivated couple who each bring their knowledge and experience to this shared journey.",
          )}
        </p>
        <div className="about-grid">
          <article className="about-card">
            <p className="eyebrow">
              {tr("Science, training and corrective exercise")}
            </p>
            <h3>{tr("Maryam Boostani")}</h3>
            <p>
              {tr(
                "Maryam Boostani holds a master's degree in exercise physiology from Allameh Tabataba'i University and leads Roxana's scientific, training and corrective exercise work.",
              )}
            </p>
          </article>
          <article className="about-card">
            <p className="eyebrow">
              {tr("Business management and infrastructure")}
            </p>
            <h3>{tr("Mohammad Golchin")}</h3>
            <p>
              {tr(
                "With a background in computing and a master's in business administration (",
              )}
              <bdi>{tr("MBA")}</bdi>
              {tr(
                "), Mohammad Golchin manages Roxana's business and infrastructure.",
              )}
            </p>
          </article>
        </div>
      </section>
      <section className="about-section" aria-labelledby="about-purpose-title">
        <h2 id="about-purpose-title">
          {tr("What does Roxana do, and what is our purpose?")}
        </h2>
        <p>
          {tr(
            "Roxana is a smart platform for health, fitness, nutrition and lifestyle improvement, especially for women who want to improve body composition, lose or gain weight, and address posture concerns.",
          )}
        </p>
        <div className="about-mission">
          <h3>{tr("Healthier, happier and stronger")}</h3>
          <p>
            {tr(
              "Our aim is to help you work towards a healthy weight and lasting well-being through a thoughtful, evidence-informed approach. We believe in changes that fit into everyday life and that you can keep up over time.",
            )}
          </p>
        </div>
      </section>
      <section className="about-section" aria-labelledby="about-start-title">
        <h2 id="about-start-title">{tr("Your journey with Roxana")}</h2>
        <p>{tr("Choose one of our two assessments to get started:")}</p>
        <div className="about-grid">
          <article className="about-card about-path">
            <h3>{tr("BMI calculator and initial medication assessment")}</h3>
            <p>
              {tr("Enter your height and weight to see your body mass index (")}
              <bdi>{tr("BMI")}</bdi>
              {tr(
                ") and complete an initial assessment for medical weight-loss options. A doctor and nutrition specialists oversee any further review and treatment decisions.",
              )}
            </p>
            <a className="button" href={sitePath("/assessment/")}>
              {tr("Start weight assessment")}
            </a>
          </article>
          <article className="about-card about-path">
            <h3>{tr("Lifestyle assessment and a personalized plan")}</h3>
            <p>
              {tr(
                "Tell us about your health, nutrition, daily activity and goals. The Roxana team can then guide you towards a personalized home or gym exercise program, meal plan and corrective exercises.",
              )}
            </p>
            <a className="button secondary" href={sitePath("/questionnaire/")}>
              {tr("Start lifestyle assessment")}
            </a>
          </article>
        </div>
      </section>
    </div>
  );
}
export { AboutContent, FaqContent, PrivacyContent };
