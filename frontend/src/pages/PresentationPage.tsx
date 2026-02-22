/**
 * PresentationPage — standalone hackathon demo showcase at /demo
 * Does NOT modify the existing HomePage.
 */
import React from "react";
import { Link } from "react-router-dom";
import styles from "./PresentationPage.module.css";

const STATS = [
  { value: 5,  label: "AI Features Live" },
  { value: 7,  label: "Languages" },
  { value: 35, label: "Australian Cities" },
  { value: 12, label: "AWS Services" },
];

const CHALLENGES = [
  { icon: "🌡️", title: "Climate Volatility",  desc: "Unpredictable heat, frost, floods and droughts devastate crops with little warning." },
  { icon: "📉", title: "Market Uncertainty",  desc: "Commodity price swings leave farmers unable to plan or maximise their returns." },
  { icon: "🌱", title: "Knowledge Gap",       desc: "Remote farmers lack timely expert advice on disease, planting, and best practices." },
];

const FEATURES = [
  {
    num: "01", icon: "🌦️", color: "#3b82f6",
    name: "Smart Weather & Disaster Alerts",
    metric: "7-day AI forecast",
    desc: "Real-time high-temp, frost, flood and drought alerts for 35 Australian cities. Bedrock-generated farming advisory tailored to your location.",
    href: "/weather",
  },
  {
    num: "02", icon: "🔬", color: "#84cc16",
    name: "AI Crop Disease Detection",
    metric: "Instant photo diagnosis",
    desc: "Upload a photo — Amazon Bedrock identifies diseases, pest damage, and nutrient deficiencies with treatment recommendations in seconds.",
    href: "/diagnosis",
  },
  {
    num: "03", icon: "🌱", color: "#22c55e",
    name: "Farm Planning Advisor",
    metric: "Crops, livestock & produce",
    desc: "AI recommends the most profitable crops and livestock based on soil type, climate, and current market data.",
    href: "/farm-recommendation",
  },
  {
    num: "04", icon: "📈", color: "#f59e0b",
    name: "Market Price Intelligence",
    metric: "Real-time commodity data",
    desc: "Live commodity prices with Bedrock-powered market insight summaries to help farmers time sales for maximum profit.",
    href: "/market-prices",
  },
  {
    num: "05", icon: "🎙️", color: "#a855f7",
    name: "Multilingual Voice Assistant",
    metric: "7 languages supported",
    desc: "Voice farming queries via AWS Transcribe and Polly — making AI accessible to low-literacy and CALD farmers across Australia.",
    href: "/voice",
  },
];

const AWS_SERVICES = [
  "Amazon Bedrock (Claude 3.5)", "AWS Lambda", "Amazon API Gateway",
  "Amazon DynamoDB", "Amazon S3", "Amazon SNS",
  "Amazon Cognito", "Amazon Transcribe", "Amazon Polly",
  "AWS CDK", "AWS Amplify", "Amazon CloudFront",
];

function useCountUp(target: number): number {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let cur = 0;
    const inc = target / 40;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(cur));
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

function StatItem({ stat, last }: { stat: typeof STATS[number]; last: boolean }) {
  const n = useCountUp(stat.value);
  return (
    <>
      <div className={styles.stat}>
        <span className={styles.statValue}>{n}</span>
        <span className={styles.statLabel}>{stat.label}</span>
      </div>
      {!last && <span className={styles.statDivider} aria-hidden="true" />}
    </>
  );
}

function FeatureCard({ f }: { f: typeof FEATURES[number] }) {
  return (
    <Link to={f.href} className={styles.featureLink}>
      <div className={styles.featureCard} style={{ "--fc": f.color } as React.CSSProperties}>
        <span className={styles.featureNum}>{f.num}</span>
        <div className={styles.featureIconWrap}>
          <span className={styles.featureIcon}>{f.icon}</span>
        </div>
        <h3 className={styles.featureName}>{f.name}</h3>
        <span className={styles.featureMetric}>{f.metric}</span>
        <p className={styles.featureDesc}>{f.desc}</p>
        <div className={styles.featureFooter}>
          <span className={styles.badgeLive}><span className={styles.liveDot} />Live</span>
          <span className={styles.featureTry}>Try it →</span>
        </div>
      </div>
    </Link>
  );
}

export function PresentationPage() {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <span className={styles.hackBadge}>🏆 AWS Hackathon 2026 · Melbourne</span>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroLogo}>🌾</div>
        <h1 className={styles.heroTitle}>Harvest <span className={styles.accent}>AI</span></h1>
        <p className={styles.heroTagline}>The agentic AI platform for Australian farmers</p>
        <p className={styles.heroDesc}>
          Weather Intelligence · AI Crop Diagnosis · Farm Planning · Market Insights · Voice AI
        </p>
        <div className={styles.ctaRow}>
          <Link to="/weather"             className={styles.ctaPrimary}>🌦️ Live Demo</Link>
          <Link to="/diagnosis"           className={styles.ctaGhost}>🔬 Crop AI</Link>
          <Link to="/farm-recommendation" className={styles.ctaGhost}>🌱 Farm Planner</Link>
          <Link to="/market-prices"       className={styles.ctaGhost}>📈 Markets</Link>
          <Link to="/voice"               className={styles.ctaGhost}>🎙️ Voice</Link>
        </div>
        <div className={styles.statsRow}>
          {STATS.map((s, i) => (
            <StatItem key={s.label} stat={s} last={i === STATS.length - 1} />
          ))}
        </div>
        <div className={styles.scrollHint} aria-hidden="true">↓</div>
      </section>

      {/* ── Problem strip ── */}
      <section className={styles.problem}>
        <p className={styles.problemEyebrow}>Why Harvest AI?</p>
        <h2 className={styles.problemTitle}>Australian Agriculture Faces Real Challenges</h2>
        <div className={styles.challengeGrid}>
          {CHALLENGES.map((c) => (
            <div key={c.title} className={styles.challengeCard}>
              <span className={styles.challengeIcon}>{c.icon}</span>
              <h4 className={styles.challengeTitle}>{c.title}</h4>
              <p className={styles.challengeDesc}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features}>
        <p className={styles.sectionEyebrow}>Platform Features</p>
        <h2 className={styles.sectionTitle}>5 AI-Powered Solutions, Built on AWS</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => <FeatureCard key={f.num} f={f} />)}
        </div>
      </section>

      {/* ── AWS stack ── */}
      <section className={styles.awsSection}>
        <p className={styles.awsLabel}>Built entirely on AWS</p>
        <div className={styles.awsPills}>
          {AWS_SERVICES.map((s) => <span key={s} className={styles.awsPill}>{s}</span>)}
        </div>
      </section>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerBack}>← Back to App</Link>
        <span>© {new Date().getFullYear()} Harvest AI · Powered by Amazon Bedrock</span>
      </footer>

    </div>
  );
}
