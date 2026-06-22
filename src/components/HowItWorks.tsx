import { Calendar, Car, CheckCircle } from "lucide-react";

const STEPS = [
  {
    icon: Calendar,
    title: "Choose your trip",
    desc: "Book a single journey or return trip. Select your airport and travel dates.",
  },
  {
    icon: Car,
    title: "Get a fixed price",
    desc: "See your price instantly. No surge pricing, no hidden fees. Pay the driver on the day.",
  },
  {
    icon: CheckCircle,
    title: "Ride with confidence",
    desc: "Your driver confirms the booking. Track your reference number and enjoy a smooth transfer.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-app-bg dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-5xl dark:text-white">How it works</h2>
          <p className="mt-4 text-lg text-muted">
            Book your airport transfer in under 2 minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-light dark:bg-brand/10 flex items-center justify-center mx-auto">
                <step.icon className="w-8 h-8 text-brand" />
              </div>
              <span className="inline-block mt-6 text-sm font-bold text-brand-gradient">
                Step {i + 1}
              </span>
              <h3 className="mt-2 text-xl font-bold dark:text-white">{step.title}</h3>
              <p className="mt-3 text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
