import { TopBar } from "../components/Chrome";

export default function SafetyPage() {
  return (
    <div className="min-h-dvh bg-ink">
      <div className="relative h-16">
        <TopBar />
      </div>
      <article className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-lime">Community guidelines</p>
        <h1 className="font-display text-4xl font-extrabold leading-none">Scenes should feel like rooms you chose.</h1>
        <p className="text-mute">
          CulturePulse is built for grassroots gatherings — not ticketed festivals. Safety is a product feature, not a
          footer link.
        </p>
        <section className="space-y-3 rounded-3xl border border-white/10 bg-surface p-5 text-sm leading-relaxed">
          <h2 className="font-display text-xl font-bold">For hosts</h2>
          <ul className="list-disc space-y-1 pl-5 text-mute">
            <li>Use a fuzzy pin for private homes, queer spaces, and anything after dark that isn't a public plaza.</li>
            <li>Write a rain plan and a lighting note. Capacity is a promise, not a vibe.</li>
            <li>Last-minute updates go to everyone who RSVP'd — use them.</li>
            <li>Mark the pulse finished so attendees can leave a one-sentence reflection.</li>
          </ul>
        </section>
        <section className="space-y-3 rounded-3xl border border-white/10 bg-surface p-5 text-sm leading-relaxed">
          <h2 className="font-display text-xl font-bold">For attendees</h2>
          <ul className="list-disc space-y-1 pl-5 text-mute">
            <li>Anonymous RSVP hides your name from the public list. The host still sees a seat is taken.</li>
            <li>Report anything that feels off. Trust & safety reviews the queue in the admin panel.</li>
            <li>You can hide attendance from your profile. Your scene, your visibility.</li>
          </ul>
        </section>
        <section className="space-y-3 rounded-3xl border border-white/10 bg-surface p-5 text-sm leading-relaxed">
          <h2 className="font-display text-xl font-bold">What we don't host</h2>
          <p className="text-mute">
            Commercial stadium shows, paywalled drop-in classes, or anything that requires a stranger to share a private
            address without a fuzzy radius. If it needs a press release, it isn't a micro-scene.
          </p>
        </section>
      </article>
    </div>
  );
}
