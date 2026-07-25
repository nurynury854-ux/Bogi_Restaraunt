import Link from "next/link";
import { ArrowRight, UtensilsCrossed, Clock3, ImageIcon, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PLATFORM_NAME } from "@/lib/constants";

const FEATURES = [
  {
    icon: UtensilsCrossed,
    title: "Your menu, your way",
    body: "Add categories and items, upload photos, and toggle things on or off in seconds.",
  },
  {
    icon: Store,
    title: "Multiple locations",
    body: "Run more than one location? Manage every branch's menu, hours, and orders from one place.",
  },
  {
    icon: Clock3,
    title: "Live order management",
    body: "New orders show up instantly with a sound alert. Mark them complete with one tap.",
  },
  {
    icon: ImageIcon,
    title: "Make it yours",
    body: "Your business name, logo, and brand color — your site looks like your business, not a template.",
  },
];

export default function MarketingHomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <span className="font-[family-name:var(--font-display)] text-xl font-bold text-ink-900">
          {PLATFORM_NAME}
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-600"
          >
            Log In
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 py-16 text-center sm:py-24">
        <span className="inline-flex items-center rounded-full bg-brand-100 px-3.5 py-1 text-xs font-semibold tracking-wide text-brand-700">
          Online ordering, built for restaurants
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
          Launch your own online ordering site in minutes
        </h1>
        <p className="mt-4 max-w-xl text-base text-ink-500 sm:text-lg">
          Create your menu, set up your locations, and start taking orders today —
          no developer needed, no waiting on anyone.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" fullWidth>
              Create your site
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" fullWidth>
              I already have a site
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="flex items-start gap-4 p-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-ink-500">{feature.body}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
