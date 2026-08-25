import {
  TrendingUp,
  HeartHandshake,
  Repeat,
  CalendarX,
} from 'lucide-react';

const items = [
  {
    icon: TrendingUp,
    title: 'More Bookings',
    text: 'A frictionless booking flow converts more visitors into confirmed guests.',
  },
  {
    icon: HeartHandshake,
    title: 'Stronger Guest Relationships',
    text: 'Guest profiles and history help your team recognize regulars instantly.',
  },
  {
    icon: Repeat,
    title: 'Increase Repeat Visits',
    text: 'Loyalty and promotions bring first-timers back again and again.',
  },
  {
    icon: CalendarX,
    title: 'Reduce No-Shows',
    text: 'Reminders and deposits keep your tables filled with guests who show up.',
  },
];

export default function GrowthSection() {
  return (
    <section className="relative overflow-hidden bg-[#080b14] px-4 py-16 sm:px-6 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-[#667eea]/[0.07] blur-[110px]" />

      <div className="relative mx-auto max-w-[1150px]">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[1.15px] text-[#9da8ff]">
            Designed Around Your Growth
          </div>

          <h2 className="text-[clamp(28px,3.8vw,40px)] font-extrabold tracking-[-1.3px] text-[#f5f7fb]">
            Built to help you grow
          </h2>

          <p className="mx-auto mt-3 max-w-[520px] text-[12.5px] leading-[1.7] text-[#818ca0]">
            Turn more visitors into guests, more guests into regulars, and
            better data into better decisions.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.018] p-6 transition-all hover:-translate-y-1 hover:border-white/[0.1] hover:bg-white/[0.03]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#818cf8]/[0.1] text-[#9da8ff]">
                <item.icon className="h-5 w-5" />
              </div>

              <div className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#667eea]">
                0{index + 1}
              </div>

              <strong className="mb-2 block text-[14px] font-bold text-white">
                {item.title}
              </strong>

              <p className="text-[11.5px] leading-[1.7] text-[#818ca0]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}