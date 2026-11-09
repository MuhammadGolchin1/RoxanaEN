import React from "react";
import { sitePath } from "../lib/paths.js";
const FAQ_ITEMS = [
  {
    question: "How exactly does Roxana help with my fitness and health?",
    answer: (
      <p>
        {
          "At Roxana, our aim is to build a healthy, lasting lifestyle that fits your body and everyday life, rather than a restrictive, short-term diet. You will have the support of a "
        }
        <strong>
          team of doctors, nutrition specialists, exercise professionals and
          corrective exercise specialists
        </strong>
        {
          " who review your circumstances together and help you take an evidence-informed approach, through lifestyle changes and, where appropriate, medical care."
        }
      </p>
    ),
  },
  {
    question:
      "What is the difference between the two forms, and which should I complete?",
    answer: (
      <React.Fragment>
        <p>
          There are two different ways to start, depending on what you are
          looking for:
        </p>
        <ul>
          <li>
            <strong>
              <a href={sitePath('/assessment/')}>
                Form one — BMI calculation and initial medication assessment:
              </a>
            </strong>
            {
              " This form shows whether your BMI is within the site's initial assessment range for weight-loss medication. If you would like a medical review, leave your details to connect with our medical and nutrition team."
            }
          </li>
          <li>
            <strong>
              <a href={sitePath('/questionnaire/')}>
                Form two — lifestyle assessment and a personalized plan, get fit
                by Nowruz:
              </a>
            </strong>
            {
              " This form is separate from medication eligibility and BMI thresholds. It is for people who want to start "
            }
            <strong>
              Roxana coaching, a personalized meal plan and an individual
              exercise program
            </strong>
            . You will be asked about your lifestyle, food preferences,
            activity, weight and goals so the team can get to know you and
            discuss your next steps.
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
          {
            "If your BMI is above 30 and you send us your details, we connect you with our "
          }
          <strong>doctors and nutrition specialists</strong>:
        </p>
        <ol>
          <li>
            <strong>Medical consultation and review:</strong>
            {
              " A doctor first reviews your health, existing conditions and family history to assess whether weight-loss medication is appropriate for you."
            }
          </li>
          <li>
            <strong>If a doctor recommends medication:</strong>
            {
              " If you are a suitable candidate, a doctor may prescribe treatment. "
            }
            <strong>At the same time,</strong>
            {
              " our nutrition and exercise specialists develop a plan to support your nutrition, strength and longer-term weight management during treatment."
            }
          </li>
          <li>
            <strong>
              If medication is unsuitable, or you prefer not to use it:
            </strong>
            {
              " Medication is optional. If your doctor does not recommend it, or you prefer a different approach, you can work towards your goals with "
            }
            <strong>
              Roxana's personalized nutrition and exercise programs
            </strong>
            , supported by our nutrition and exercise specialists.
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
          No. Our nutrition and exercise plans are personalized to your goals
          and circumstances:
        </p>
        <ul>
          <li>
            <strong>Choose where you train:</strong>
            {" Whether you prefer to exercise at "}
            <strong>home</strong>
            {" with minimal equipment or at a "}
            <strong>Gym</strong>, your plan is designed around the option that
            works best for you.
          </li>
          <li>
            <strong>Support for different goals:</strong>
            {" Our nutrition and exercise programs support "}
            <strong>weight loss and fat loss</strong>
            {", "}
            <strong>weight gain and muscle building</strong>
            {", and "}
            <strong>maintaining health and fitness</strong>.
          </li>
          <li>
            <strong>Specialist corrective exercise:</strong>
            {
              " If you have posture concerns, joint pain or issues such as excessive lower-back arch, rounded shoulders or knee pain, our exercise specialists can incorporate a "
            }
            <strong>tailored corrective exercise plan</strong>
            {
              " alongside your fitness program, taking your needs and limitations into account."
            }
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
        {
          "When you submit the second form, your lifestyle information, food preferences and physical circumstances are shared with the Roxana team. After an initial review, "
        }
        <strong>our advisers and specialist team contact you</strong>
        {
          " to discuss the next steps, suitable packages and the details of your nutrition and exercise plans."
        }
      </p>
    ),
  },
];
function FaqContent() {
  return (
    <div className="faq-list">
      {FAQ_ITEMS.map(({ question: l, answer: a }, n) => (
        <details className="faq-item" key={l}>
          <summary className="faq-question">
            <span className="faq-number" aria-hidden="true">
              {new Intl.NumberFormat("en-US").format(n + 1)}
            </span>
            <h2>{l}</h2>
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
  return (
    <article className="privacy-policy" aria-labelledby="privacy-policy-title">
      <h2 id="privacy-policy-title">
        {"Your privacy — trusted to Roxana "}
        <span aria-hidden="true">🔒🌿</span>
      </h2>
      <p className="privacy-policy__intro">
        {
          "At Roxana, we understand that discussing your weight, health, eating habits and sharing body photos takes trust. The information you provide in our forms is treated as "
        }
        <strong>confidential</strong>, with your privacy and peace of mind at
        the heart of our approach:
      </p>
      <ul className="privacy-policy__sections">
        <li>
          <h3>Your information, for your health</h3>
          <p>
            {
              "The information you share with Roxana, from your height, weight and medical history to your lifestyle and contact details, is used "
            }
            <strong>
              solely to review your circumstances, provide health consultations
              and develop your personalized nutrition and exercise plan
            </strong>
            . It is not shared with unrelated individuals or organizations.
          </p>
        </li>
        <li>
          <h3>Protecting your photos</h3>
          <p>
            {
              "If you choose to share body photos during your assessment or corrective exercise review, "
            }
            <strong>your photos are treated as private</strong>. Only the
            relevant specialist or coach reviews them, for assessing posture,
            muscular symmetry and your individual plan. They are never
            published, even as anonymous examples.
          </p>
        </li>
        <li>
          <h3>Deleting photos after your program</h3>
          <p>
            {
              "We do not keep a permanent archive of your personal photos. Once your program and work with Roxana have ended, "
            }
            <strong>
              your submitted photos are permanently deleted from our servers and
              systems
            </strong>
            , with no copies retained.
          </p>
        </li>
      </ul>
    </article>
  );
}
function AboutContent() {
  return (
    <div className="about-content">
      <div className="about-intro">
        <div className="about-intro__copy">
          <p className="eyebrow">Your smart companion on the path to health</p>
          <h2>Roxana — a smart companion, backed by specialists</h2>
          <p>
            Roxana is an AI character and companion supported by a team of
            specialists. We bring expertise and technology together to make
            health, fitness, nutrition and lifestyle changes easier to approach
            and better suited to your needs.
          </p>
        </div>
        <img
          className="about-intro__portrait"
          src={sitePath('/roxana-portrait-reference-botanical.png')}
          alt="Roxana, an AI character in turquoise sportswear with botanical details"
          width="1383"
          height="1137"
          decoding="async"
        />
      </div>
      <section className="about-section" aria-labelledby="about-team-title">
        <h2 id="about-team-title">The people behind Roxana</h2>
        <p>
          Roxana is run by Maryam Boostani and Mohammad Golchin, a motivated
          couple who each bring their knowledge and experience to this shared
          journey.
        </p>
        <div className="about-grid">
          <article className="about-card">
            <p className="eyebrow">Science, training and corrective exercise</p>
            <h3>Maryam Boostani</h3>
            <p>
              Maryam Boostani holds a master's degree in exercise physiology
              from Allameh Tabataba'i University and leads Roxana's scientific,
              training and corrective exercise work.
            </p>
          </article>
          <article className="about-card">
            <p className="eyebrow">Business management and infrastructure</p>
            <h3>Mohammad Golchin</h3>
            <p>
              With a background in computing and a master's in business
              administration (<bdi>MBA</bdi>), Mohammad Golchin manages Roxana's
              business and infrastructure.
            </p>
          </article>
        </div>
      </section>
      <section className="about-section" aria-labelledby="about-purpose-title">
        <h2 id="about-purpose-title">
          What does Roxana do, and what is our purpose?
        </h2>
        <p>
          Roxana is a smart platform for health, fitness, nutrition and
          lifestyle improvement, especially for women who want to improve body
          composition, lose or gain weight, and address posture concerns.
        </p>
        <div className="about-mission">
          <h3>Healthier, happier and stronger</h3>
          <p>
            Our aim is to help you work towards a healthy weight and lasting
            well-being through a thoughtful, evidence-informed approach. We
            believe in changes that fit into everyday life and that you can keep
            up over time.
          </p>
        </div>
      </section>
      <section className="about-section" aria-labelledby="about-start-title">
        <h2 id="about-start-title">Your journey with Roxana</h2>
        <p>Choose one of our two assessments to get started:</p>
        <div className="about-grid">
          <article className="about-card about-path">
            <h3>BMI calculator and initial medication assessment</h3>
            <p>
              Enter your height and weight to see your body mass index (
              <bdi>BMI</bdi>) and complete an initial assessment for medical
              weight-loss options. A doctor and nutrition specialists oversee
              any further review and treatment decisions.
            </p>
            <a className="button" href={sitePath('/assessment/')}>
              Start weight assessment
            </a>
          </article>
          <article className="about-card about-path">
            <h3>Lifestyle assessment and a personalized plan</h3>
            <p>
              Tell us about your health, nutrition, daily activity and goals.
              The Roxana team can then guide you towards a personalized home or
              gym exercise program, meal plan and corrective exercises.
            </p>
            <a className="button secondary" href={sitePath('/questionnaire/')}>
              Start lifestyle assessment
            </a>
          </article>
        </div>
      </section>
    </div>
  );
}
export { AboutContent, FaqContent, PrivacyContent };
