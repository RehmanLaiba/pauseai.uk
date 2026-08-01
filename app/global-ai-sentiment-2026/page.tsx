import type { Metadata } from "next";
import Nav from "@/components/Nav";
import {
  GLOBAL_AVERAGE,
  GLOBAL_MOE_PP,
  GLOBAL_N,
  QUESTION_TEXT,
  RESPONSE_OPTIONS,
  SURVEY_META,
} from "@/lib/data/aiSentiment2026";
import WorldMap from "./WorldMap";
import CountryExplorer from "./CountryExplorer";
import DemographicsExplorer from "./DemographicsExplorer";
import DivergingBar from "./DivergingBar";
import { AnnotatedBarHeader, AnnotatedBarFooter } from "./AnnotatedBar";
import "../track-record/track-record.css";
import "./global-ai-sentiment-2026.css";

const TITLE = "Global Attitudes to AI 2026";
const DESCRIPTION =
  "How 377,458 people across 104 countries feel about the development of superintelligent AI: an interactive look at the Nira Data Spring 2026 World Omnibus.";

export const metadata: Metadata = {
  title: `PauseAI UK | ${TITLE}`,
  description: DESCRIPTION,
  openGraph: {
    title: `PauseAI UK | ${TITLE}`,
    description: DESCRIPTION,
    images: [
      {
        url: "/images/open-graph/open-graph-1200-630.jpg",
        width: 1200,
        height: 630,
      },
    ],
    url: "https://pauseai.uk/global-ai-sentiment-2026/",
  },
  twitter: {
    images: ["/images/open-graph/open-graph-1600-840.jpg"],
  },
  alternates: { canonical: "/global-ai-sentiment-2026" },
};

export default function GlobalAiSentiment2026Page() {
  return (
    <>
      <Nav />
      <main className="track-record gas-page">
        <section className="tr-hero">
          <div className="container tr-hero-inner">
            <h1 className="tr-hero-title">{TITLE}</h1>
            <p className="gas-hero-lede">{DESCRIPTION}</p>
          </div>
        </section>

        <section className="gas-stats">
          <div className="container gas-stats-inner">
            <div className="gas-stat">
              <span className="gas-stat-value">
                {SURVEY_META.respondents.toLocaleString()}
              </span>
              <span className="gas-stat-label">Respondents</span>
            </div>
            <div className="gas-stat">
              <span className="gas-stat-value">{SURVEY_META.countries}</span>
              <span className="gas-stat-label">Countries surveyed</span>
            </div>
            <div className="gas-stat">
              <span className="gas-stat-value">{SURVEY_META.fieldwork}</span>
              <span className="gas-stat-label">Fieldwork window</span>
            </div>
            <div className="gas-stat">
              <span className="gas-stat-value">60%</span>
              <span className="gas-stat-label">
                Want development slowed, paused or stopped
              </span>
            </div>
          </div>
        </section>

        <section className="gas-section">
          <div className="container">
            <h2>The question asked</h2>
            <blockquote className="gas-question">{QUESTION_TEXT}</blockquote>
            <p className="gas-key-stat">
              Six in ten people globally want AI development slowed in some form. Fewer than one in five want it developed &ldquo;as quickly as possible&rdquo;.
            </p>
            <div id="gas-demo-wrap" className="gas-demo-wrap">
              <div className="gas-bar-list gas-global-bar">
                <AnnotatedBarHeader row={GLOBAL_AVERAGE} />
                <DivergingBar
                  label="Global average"
                  row={GLOBAL_AVERAGE}
                  netId="gas-demo-net"
                  meta={
                    <>
                      <span id="gas-demo-n">n={GLOBAL_N.toLocaleString()}</span>{" "}
                      · <span id="gas-demo-moe">&plusmn;{GLOBAL_MOE_PP}pp</span>{" "}
                      (approx.)
                    </>
                  }
                />
              </div>
              <AnnotatedBarFooter wrapId="gas-demo-wrap" />
            </div>
            <ul className="gas-legend-key gas-legend-key-mobile">
              {RESPONSE_OPTIONS.map((option) => (
                <li key={option.key}>
                  <span
                    className="gas-legend-dot"
                    style={{ background: option.light }}
                  />
                  {option.label}
                </li>
              ))}
            </ul>
            <div className="gas-howto">
              <h3>How to read these bars</h3>
              <p>
                Each bar is a single country or group, split into the five
                response options above. The segments add up to 100% of
                respondents. Wider segments mean more people picked that option.
                Hover or tap a segment for the exact figure.
              </p>
              <p>
                The number to the right is the <strong>net opinion</strong>: the
                share who want development to continue as quickly as possible,
                minus the share who want it stopped, paused, or placed under
                strict oversight. A negative score (shown in red) means
                opposition to rapid development outweighs support for it. A
                positive score (shown in blue) means the opposite. It is a
                summary of the whole bar, not a sixth category.
              </p>
              <p>
                <strong>n</strong> is the number of people surveyed for that
                row. <strong>&plusmn;pp</strong> is the margin of error, in
                percentage points, at 95% confidence: how far the true figure
                could plausibly sit above or below what&rsquo;s shown, just from
                sampling a subset of the population rather than everyone.
                Smaller samples (a small country, a narrow demographic slice)
                have a wider margin of error and so should be read with more
                caution.
              </p>
            </div>
            <p className="gas-source-note">
              <a href={SURVEY_META.reportUrl} target="_blank" rel="noreferrer">
                Read the full report
              </a>
              .
            </p>
          </div>
        </section>

        <section className="gas-section gas-section-muted">
          <div className="container">
            <h2>Explore the map</h2>
            <p className="gas-section-intro">
              Hover any country to see its full breakdown. Switch the metric to
              see who wants development stopped, paused, overseen, or
              accelerated.
            </p>
            <WorldMap />
          </div>
        </section>

        <section className="gas-section">
          <div className="container">
            <h2>All 104 countries</h2>
            <p className="gas-section-intro">
              Filter by region, sort by opinion, or search for a country.
              &ldquo;Net opinion&rdquo; is the share who want development to
              continue as quickly as possible, minus the share who want it
              stopped, paused or placed under strict oversight.
            </p>
            <CountryExplorer />
          </div>
        </section>

        <section className="gas-section gas-section-muted">
          <div className="container">
            <h2>By demographic</h2>
            <p className="gas-section-intro">
              Regional averages and demographic breakdowns from the survey,
              including a UK/US deep dive.
            </p>
            <DemographicsExplorer />
          </div>
        </section>

        <section className="gas-section gas-methodology">
          <div className="container">
            <h2>Methodology</h2>
            <p>
              Data from {SURVEY_META.publisher}&rsquo;s Spring 2026 World
              Omnibus: {SURVEY_META.respondents.toLocaleString()} respondents
              across {SURVEY_META.countries} countries, surveyed online and
              weighted to national benchmarks, fieldwork performed from{" "}
              {SURVEY_META.fieldwork}. Margins of error per country are shown
              alongside each result. PauseAI UK did not commission this survey.
              We are republishing it because it is the most comprehensive recent
              look at global public opinion on AI development.
            </p>
            <p>
              <a href={SURVEY_META.reportUrl} target="_blank" rel="noreferrer">
                View the full report
              </a>{" "}
              for the executive summary, questionnaire and full regional
              analysis.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
