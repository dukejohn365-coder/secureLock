import Link from "next/link"
import {
  ShieldCheck,
  KeyRound,
  Wand2,
  ArrowRight,
  Lock,
  EyeOff,
  AlertTriangle,
  Zap,
  ServerOff,
  Check,
  Star,
  Globe,
  AtSign,
  Mail,
  Sparkles,
  Layers,
  RefreshCw,
  Fingerprint,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingNav } from "@/components/landing/landing-nav"
import { cn } from "@/lib/utils"

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SecureLock",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description:
    "Free zero-knowledge password manager. Encrypt and store passwords locally in your browser with AES-256. No databases, no tracking, no servers storing your secrets.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Local AES-GCM 256 encryption",
    "PBKDF2 key derivation",
    "Secure password generator",
    "Security audits for weak or reused passwords",
    "Zero-knowledge architecture",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1284",
  },
}

const FEATURES = [
  {
    icon: Lock,
    title: "End-to-end encrypted vault",
    description:
      "Every password is sealed with AES-256-GCM before it ever touches storage. Your secrets never exist in plaintext.",
  },
  {
    icon: ServerOff,
    title: "Zero-knowledge, zero servers",
    description:
      "There is no database of your passwords. Your vault lives only in your browser — even we can't see it.",
  },
  {
    icon: Fingerprint,
    title: "PBKDF2 key derivation",
    description:
      "Your master password is stretched 600,000 times to derive a key no brute-force attack can crack.",
  },
  {
    icon: Wand2,
    title: "Secure password generator",
    description:
      "Create cryptographically strong passwords in one click with full control over length and character sets.",
  },
  {
    icon: AlertTriangle,
    title: "Instant security audits",
    description:
      "Automatically flag weak, reused, or breached passwords and fix them before they become a problem.",
  },
  {
    icon: Zap,
    title: "Lightning fast & offline",
    description:
      "Your vault works instantly and even offline — there's no round-trip to a server for your data.",
  },
]

const STEPS = [
  {
    step: "01",
    title: "Create your free account",
    description:
      "Sign up with just an email and a password you'll remember. That one password becomes the key to your vault.",
  },
  {
    step: "02",
    title: "Save passwords as you browse",
    description:
      "Add logins manually or generate strong ones. Everything is encrypted locally and auto-saved to your vault.",
  },
  {
    step: "03",
    title: "Let SecureLock watch your back",
    description:
      "Get instant alerts on weak or reused passwords and upgrade your security in minutes — all free, forever.",
  },
]

const TESTIMONIALS = [
  {
    quote:
      "I moved my whole family's logins over in an afternoon. Knowing not a single password exists on a server is priceless.",
    name: "Sarah Mitchell",
    role: "Freelance designer",
  },
  {
    quote:
      "The security audit caught 14 reused passwords I'd been ignoring for years. This is the password manager I always wanted.",
    name: "David Chen",
    role: "Product engineer",
  },
  {
    quote:
      "Fast, free, and genuinely zero-knowledge. It feels like 1Password and Bitwarden, but nothing ever leaves my device.",
    name: "Amara Okafor",
    role: "Startup founder",
  },
]

const FAQS = [
  {
    q: "Is SecureLock really free?",
    a: "Yes — completely free, forever. No trials, no paywalls, no credit card. Secure encryption shouldn't cost a thing.",
  },
  {
    q: "Where are my passwords stored?",
    a: "Only in your browser's local storage, encrypted with AES-256-GCM. There is no central database, so there is nothing for a hacker to steal — even if we were breached.",
  },
  {
    q: "What happens if I forget my master password?",
    a: "Because of our zero-knowledge design, we can't reset it for you — and neither can anyone else. That's the tradeoff for real privacy. Use our recovery tips to keep it safe.",
  },
  {
    q: "Is my data synced across devices?",
    a: "Your vault is stored locally and is never sent to our servers. This keeps it private by design — you can always export your vault as an encrypted backup.",
  },
  {
    q: "What encryption do you use?",
    a: "AES-256-GCM for encrypting your vault, with a key derived from your master password using PBKDF2 with 600,000 iterations.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. Because everything lives in your browser, your vault unlocks instantly and works without an internet connection.",
  },
]

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-muted-foreground text-pretty md:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <LandingNav />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="landing-bg relative overflow-hidden">
        <div className="landing-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-16 text-center md:px-8 md:pb-32 md:pt-24">
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="size-4" />
            Zero-knowledge. 100% free. Forever.
          </div>

          <h1 className="animate-fade-in-up mt-6 max-w-4xl text-4xl font-black tracking-tight text-balance md:text-6xl lg:text-7xl">
            All your passwords, sealed in a vault{" "}
            <span className="gradient-text">only you can open.</span>
          </h1>

          <p className="animate-fade-in-up delay-100 mt-6 max-w-2xl text-base text-muted-foreground text-pretty md:text-lg">
            SecureLock encrypts every password with AES-256 right in your
            browser — and never sends it to a server. No databases, no
            tracking, no data breaches. Just peace of mind.
          </p>

          <div className="animate-fade-in-up delay-200 mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="glow-violet h-12 rounded-xl px-8 text-sm font-semibold hover:scale-[1.02] active:scale-95"
              >
                Get Started — It&apos;s Free
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </Link>
            <Link href="/dashboard/generator">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl px-8 text-sm font-semibold"
              >
                <Wand2 data-icon="inline-start" className="size-4" />
                Try the Password Generator
              </Button>
            </Link>
          </div>

          <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["No credit card", "Set up in 60 seconds", "Open source crypto"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-500" />
                  {item}
                </span>
              )
            )}
          </div>

          {/* Social proof strip */}
          <div className="animate-fade-in-up delay-300 mt-14 grid w-full max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-4">
            {[
              { value: "4.9★", label: "Average rating" },
              { value: "1.2k+", label: "Vaults secured" },
              { value: "0", label: "Server-stored secrets" },
              { value: "100%", label: "Client-side encryption" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-background px-4 py-5 text-center"
              >
                <div className="text-xl font-bold tracking-tight">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8 md:py-28">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to lock down your logins"
          description="A complete password manager — built around one radical idea: your secrets should never leave your device."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/60 bg-card/60 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="border-y border-border/60 bg-muted/40 scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <SectionHeading
            eyebrow="How it works"
            title="From chaos to control in three steps"
            description="No installs, no migrations, no learning curve. SecureLock fits into your routine in minutes."
          />

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.step} className="relative">
                <div className="text-5xl font-black tracking-tight gradient-text">
                  {step.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security deep-dive ────────────────────────────────── */}
      <section
        id="security"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8 md:py-28"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Security
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Built like a vault. Because it is one.
            </h2>
            <p className="mt-4 text-base text-muted-foreground text-pretty md:text-lg">
              Most password managers store your secrets on their servers. We
              took the opposite approach — and the security world agrees it&apos;s
              the only way to be truly safe.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: Lock,
                  title: "AES-256-GCM encryption",
                  text: "Industry-standard, military-grade encryption applied before your data ever leaves your browser.",
                },
                {
                  icon: EyeOff,
                  title: "Nothing to intercept",
                  text: "With no central database, there is no honeypot. A breach of our servers exposes nothing.",
                },
                {
                  icon: Layers,
                  title: "Privacy by architecture",
                  text: "Zero-knowledge means even we can't read your passwords. That's not a promise — it's physics.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <item.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link href="/signup" className="mt-8 inline-block">
              <Button className="h-11 rounded-xl px-6 font-semibold">
                Secure your passwords
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </Link>
          </div>

          {/* Vault visual */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-primary/10 blur-[80px]" />
            <div className="relative rounded-3xl border border-border/60 bg-card p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Lock className="size-4" />
                  </div>
                  <span className="text-sm font-semibold">My Vault</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" />
                  Locked & encrypted
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { title: "GitHub", user: "octocat", strength: 90 },
                  { title: "Netflix", user: "sarah@example.com", strength: 72 },
                  { title: "Bank of America", user: "sarah@example.com", strength: 64 },
                ].map((row) => (
                  <div
                    key={row.title}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold">{row.title}</div>
                      <div className="text-xs text-muted-foreground">{row.user}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3.5" />
                        {row.strength}
                      </span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            row.strength >= 80
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          )}
                          style={{ width: `${row.strength}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                <RefreshCw className="size-3.5" />
                Syncing to your browser… encrypted, nothing leaves your device
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="border-y border-border/60 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <SectionHeading
            eyebrow="Loved by users"
            title="People who sleep better with SecureLock"
          />

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6"
              >
                <div>
                  <div className="mb-3 flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-foreground/90">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section
        id="pricing"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 md:px-8 md:py-28"
      >
        <SectionHeading
          eyebrow="Pricing"
          title="Free now. Free forever."
          description="Great security shouldn't have a price tag. SecureLock is fully featured and completely free."
        />

        <div className="mx-auto mt-14 max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-8 shadow-2xl glow-sm-violet">
            <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-[60px]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">SecureLock Free</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="size-3.5" />
                  Most popular
                </span>
              </div>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-5xl font-black tracking-tight">$0</span>
                <span className="pb-1.5 text-sm text-muted-foreground">
                  / forever
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Everything. Unlimited passwords, no ads, no data collection.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Unlimited password storage",
                  "AES-256-GCM encryption",
                  "Password generator & strength scoring",
                  "Security audits & breach alerts",
                  "Auto-lock & privacy controls",
                  "No account required to generate",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <Check className="size-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="mt-8 block">
                <Button
                  size="lg"
                  className="glow-violet h-12 w-full rounded-xl text-sm font-semibold"
                >
                  Create your free vault
                  <ArrowRight data-icon="inline-end" className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section
        id="faq"
        className="border-t border-border/60 bg-muted/40 scroll-mt-20"
      >
        <div className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-28">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions? Answered."
          />

          <div className="mt-12 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold transition-colors hover:bg-muted/40">
                  {faq.q}
                  <span className="text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                    <span className="text-lg leading-none">+</span>
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="landing-bg relative overflow-hidden">
        <div className="landing-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center md:px-8 md:py-28">
          <KeyRound className="mx-auto size-10 text-primary" />
          <h2 className="mt-6 text-3xl font-black tracking-tight text-balance md:text-5xl">
            Your passwords deserve better.
            <br />
            <span className="gradient-text">Start free today.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground text-pretty md:text-lg">
            Join thousands who stopped worrying about their passwords. It takes
            under a minute — and it&apos;s free forever.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="glow-violet h-12 rounded-xl px-8 text-sm font-semibold hover:scale-[1.02] active:scale-95"
              >
                Get Started Now
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl px-8 text-sm font-semibold"
              >
                Log in to your vault
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg glow-sm-violet">
                  <Lock className="size-4" />
                </div>
                <span className="text-lg font-extrabold tracking-tight">
                  Secure<span className="gradient-text">Lock</span>
                </span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
                The zero-knowledge password manager. All vault items are secured
                client-side — no databases, no tracking, complete peace of mind.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-foreground">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Account</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/signup" className="hover:text-foreground">
                    Sign up
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} SecureLock Security Labs. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a
                href="#"
                aria-label="Website"
                className="transition-colors hover:text-foreground"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="#"
                aria-label="Social"
                className="transition-colors hover:text-foreground"
              >
                <AtSign className="size-4" />
              </a>
              <a
                href="#"
                aria-label="Email"
                className="transition-colors hover:text-foreground"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
