import { Link } from "wouter";
import { BarChart3, TrendingUp, Target, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground dark flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-foreground flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-background" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight uppercase">zebra</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            data-testid="link-sign-in"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-[#E8A33D] text-[#0B1220] font-semibold px-4 py-2 rounded-md hover:bg-[#d4922a] transition-colors"
            data-testid="link-sign-up"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E8A33D]/30 bg-[#E8A33D]/10 text-[#E8A33D] text-xs font-mono uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D] animate-pulse" />
          Predictive Intelligence
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Know if your campaign
          <br />
          <span className="text-[#E8A33D]">wins before it runs.</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          zebra uses a model trained on 4,000 real campaigns to predict your CAC,
          conversion rate, and ROI — before you spend a dollar.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto text-base bg-[#E8A33D] text-[#0B1220] font-semibold px-8 py-3.5 rounded-md hover:bg-[#d4922a] transition-colors"
            data-testid="link-get-started-hero"
          >
            Start predicting free
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto text-base border border-border text-foreground px-8 py-3.5 rounded-md hover:bg-muted transition-colors"
            data-testid="link-sign-in-hero"
          >
            Sign in
          </Link>
        </div>
      </main>

      {/* Feature strip */}
      <section className="border-t border-border px-8 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: TrendingUp,
              color: "#E8A33D",
              label: "ROI Forecast",
              desc: "R² 0.84 — predicted before launch",
            },
            {
              icon: Target,
              color: "#2DD4BF",
              label: "Conversion Rate",
              desc: "R² 0.91 — across 7 channels",
            },
            {
              icon: Zap,
              color: "#F2637B",
              label: "CAC Estimate",
              desc: "R² 0.81 — know your cost upfront",
            },
          ].map(({ icon: Icon, color, label, desc }) => (
            <div key={label} className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <div className="font-display font-semibold text-sm text-foreground">{label}</div>
                <div className="text-muted-foreground text-sm mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
