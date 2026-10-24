import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Lock, 
  BarChart, Layers, Eye, Cpu, FileText, CheckSquare, Zap, Play
} from 'lucide-react';
import { ThreeRibbon } from '../components/motion/ThreeRibbon';
import { FloatingShapes } from '../components/motion/FloatingShapes';
import { TiltCard } from '../components/motion/TiltCard';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-inkloom-bg text-inkloom-text overflow-hidden selection:bg-inkloom-primary/20 selection:text-inkloom-primary">
      <FloatingShapes />

      {/* Navigation Header */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-inkloom-primary via-indigo-600 to-inkloom-secondary flex items-center justify-center text-white shadow-glow-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black bg-gradient-to-r from-inkloom-primary to-inkloom-secondary bg-clip-text text-transparent">
              Inkloom AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-inkloom-primary/10 text-inkloom-primary border border-inkloom-primary/20">
              Brand Governance
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-inkloom-muted">
          <a href="#features" className="hover:text-inkloom-primary transition-colors">Features</a>
          <a href="#workflow" className="hover:text-inkloom-primary transition-colors">Workflow</a>
          <a href="#governance" className="hover:text-inkloom-primary transition-colors">Governance Rules</a>
          <a href="#explainability" className="hover:text-inkloom-primary transition-colors">Explainability</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-inkloom-text hover:text-inkloom-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/studio"
            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-inkloom-primary to-indigo-600 hover:from-inkloom-primaryHover hover:to-indigo-700 rounded-xl shadow-glow-primary hover:shadow-lg transition-all flex items-center gap-2 group"
          >
            <span>Start Reviewing</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-inkloom-border shadow-card-soft text-xs font-semibold text-inkloom-primary">
            <span className="w-2 h-2 rounded-full bg-inkloom-highlight animate-ping" />
            <span>Deterministic Local Rules + Transparent AI Assistance</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-inkloom-text leading-[1.1] tracking-tight">
            Create confidently.{' '}
            <span className="bg-gradient-to-r from-inkloom-primary via-inkloom-secondary to-inkloom-highlight bg-clip-text text-transparent">
              Stay on-brand.
            </span>{' '}
            Publish responsibly.
          </h1>

          <p className="text-base sm:text-lg text-inkloom-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Inkloom AI is the enterprise brand-governance platform that guarantees every piece of content remains 100% consistent with your approved identity, factual database, and compliance guidelines before publication.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              to="/studio"
              className="px-7 py-3.5 text-base font-bold text-white bg-gradient-to-r from-inkloom-primary to-inkloom-secondary hover:from-inkloom-primaryHover hover:to-blue-600 rounded-2xl shadow-glow-primary hover:shadow-glow-secondary transition-all flex items-center gap-2.5"
            >
              <Sparkles className="w-5 h-5" />
              <span>Launch Review Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/dashboard"
              className="px-7 py-3.5 text-base font-bold text-inkloom-text bg-white hover:bg-slate-50 border border-inkloom-border rounded-2xl shadow-card-soft hover:shadow-card-hover transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-inkloom-secondary" />
              <span>Explore Demo Workspace</span>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="pt-6 grid grid-cols-3 gap-4 border-t border-inkloom-border/60 max-w-lg mx-auto lg:mx-0">
            <div>
              <div className="text-2xl font-black text-inkloom-primary">100%</div>
              <div className="text-xs text-inkloom-muted font-medium">Deterministic Rule Precision</div>
            </div>
            <div>
              <div className="text-2xl font-black text-inkloom-secondary">0 Paid API</div>
              <div className="text-xs text-inkloom-muted font-medium">Keys Required to Run</div>
            </div>
            <div>
              <div className="text-2xl font-black text-inkloom-highlight">WCAG 2.1</div>
              <div className="text-xs text-inkloom-muted font-medium">Accessibility & Color Checks</div>
            </div>
          </div>
        </div>

        {/* 3D Visual Hero Graphic */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <TiltCard className="w-full max-w-md aspect-square relative flex items-center justify-center">
            {/* 3D Canvas Ribbon */}
            <ThreeRibbon className="w-full h-full" />

            {/* Floating Glassmorphism Badge 1 */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-card-hover border border-white flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-inkloom-error">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-inkloom-text">Prohibited Cliché Blocked</div>
                <div className="text-[10px] text-inkloom-muted">'100% guaranteed' flagged</div>
              </div>
            </motion.div>

            {/* Floating Glassmorphism Badge 2 */}
            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-card-hover border border-white flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-inkloom-success">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-inkloom-text">99.4% Brand Score</div>
                <div className="text-[10px] text-inkloom-muted">Approved for publication</div>
              </div>
            </motion.div>
          </TiltCard>
        </div>
      </section>

      {/* Complete Workflow Section */}
      <section id="workflow" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-inkloom-border/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-inkloom-primary px-3 py-1 rounded-full bg-inkloom-primary/10">
            End-to-End Governance Cycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-inkloom-text mt-3">
            How Inkloom AI Governs Your Brand
          </h2>
          <p className="text-sm sm:text-base text-inkloom-muted mt-2">
            From creative drafting to multi-tier human approval, every step is transparent, explainable, and accountable.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Define Brand Knowledge',
              desc: 'Configure approved facts, prohibited terminology, preferred lexicon, tone dos/don’ts, and brand color swatches.',
              icon: Layers,
              gradient: 'from-inkloom-primary to-indigo-600',
            },
            {
              step: '02',
              title: 'Draft & Run Review',
              desc: 'Paste or import content across blogs, ads, social posts, emails, and images. Trigger instant deterministic auditing.',
              icon: Cpu,
              gradient: 'from-inkloom-secondary to-blue-600',
            },
            {
              step: '03',
              title: 'Inspect & Apply Fixes',
              desc: 'Review flagged issues with exact excerpts, rule citations, and 1-click suggested corrections that version-control edits.',
              icon: Sparkles,
              gradient: 'from-inkloom-accent to-pink-500',
            },
            {
              step: '04',
              title: 'Human-Controlled Sign-off',
              desc: 'Submit specific content versions into the approval queue for authorized stakeholders to approve or request revisions.',
              icon: CheckSquare,
              gradient: 'from-inkloom-highlight to-emerald-500',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft hover:shadow-card-hover transition-all relative group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white font-black text-sm mb-5 shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-black tracking-widest text-inkloom-primary mb-1">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-bold text-inkloom-text mb-2">{item.title}</h3>
                <p className="text-xs text-inkloom-muted leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Explainable AI & Human Oversight Principles */}
      <section id="explainability" className="relative z-10 max-w-7xl mx-auto px-6 py-20 bg-white rounded-3xl border border-inkloom-border shadow-card-soft mb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-inkloom-secondary px-3 py-1 rounded-full bg-blue-50">
              Ethical & Explainable AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-inkloom-text">
              Assistance, Not Unquestionable Truth
            </h2>
            <p className="text-sm text-inkloom-muted leading-relaxed">
              Inkloom AI never quietly rewrites content or silently auto-publishes. For every single flagged passage, our engine shows you the exact guideline citation, explains why it was flagged, and gives you complete autonomy to accept, edit, or dismiss.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { title: 'Substantiation Verification', text: 'Distinguishes between claims contradicted by verified facts vs claims merely lacking external citations.' },
                { title: 'Deterministic Local Rule Guarantee', text: 'Operates 100% reliably on local rule heuristics with optional LLM reasoning.' },
                { title: 'Strict Multi-Tenant Isolation', text: 'No organization data or draft content is ever used for training external models.' }
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-inkloom-success flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-inkloom-text block">{p.title}</span>
                    <span className="text-xs text-inkloom-muted">{p.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-inkloom-bg p-6 rounded-3xl border border-inkloom-border/80 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-inkloom-muted flex items-center justify-between">
              <span>Live Engine Finding Preview</span>
              <span className="text-inkloom-error font-bold">Critical Severity</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-inkloom-border shadow-sm space-y-2">
              <div className="text-xs text-inkloom-muted">Flagged Excerpt:</div>
              <div className="p-2 bg-red-50 text-inkloom-error font-mono text-xs rounded-lg border border-red-200">
                "Our platform is proven #1 in the world with 100% uptime guaranteed."
              </div>
              <div className="text-xs font-semibold text-inkloom-text pt-1">
                Rule ID: <span className="font-mono text-inkloom-primary">RULE-UNSUPPORTED-SUPERLATIVE</span>
              </div>
              <p className="text-[11px] text-inkloom-muted leading-tight">
                Superlative ranking claim '#1' requires accredited third-party verification. Absolute 100% uptime contradicts standard SLA specification (99.99%).
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-inkloom-border/60">
                <span className="text-[11px] font-semibold text-inkloom-success">Suggested Fix: "industry-acclaimed platform with 99.99% SLA adherence"</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-inkloom-border text-center text-xs text-inkloom-muted flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-inkloom-primary flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-inkloom-text">Inkloom AI</span>
          <span>— Full-Stack Brand Governance Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/studio" className="hover:text-inkloom-primary">Review Studio</Link>
          <Link to="/brands" className="hover:text-inkloom-primary">Brand Profiles</Link>
          <Link to="/approvals" className="hover:text-inkloom-primary">Approvals</Link>
          <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-inkloom-primary">FastAPI Swagger UI</a>
        </div>
      </footer>
    </div>
  );
};
