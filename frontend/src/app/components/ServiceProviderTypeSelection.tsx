import { ArrowLeft, ArrowRight, Boxes, BriefcaseBusiness, Landmark, PackageCheck, Truck, ShieldCheck } from 'lucide-react';
import { updateServiceProviderType } from '../lib/serviceProviderApi';

const serviceOptions = [
  {
    id: 'equipment',
    title: 'Equipment Rental',
    description: 'Rent out tractors, harvesters, irrigation tools and other farm equipment.',
    icon: <Boxes className="h-6 w-6" />,
    accent: 'from-emerald-600 to-green-500',
  },
  {
    id: 'storage',
    title: 'Storage Facilities',
    description: 'Manage dry, cold and freezer storage spaces for farmers and agri-businesses.',
    icon: <Landmark className="h-6 w-6" />,
    accent: 'from-sky-600 to-cyan-500',
  },
  {
    id: 'packaging',
    title: 'Packaging Provider',
    description: 'Offer packaging and grading services for fresh produce and agricultural goods.',
    icon: <PackageCheck className="h-6 w-6" />,
    accent: 'from-orange-300 via-amber-200 to-yellow-200',
  },
  {
    id: 'financial',
    title: 'Financial Provider',
    description: 'Support loans, finance plans and trusted payment services for growers.',
    icon: <BriefcaseBusiness className="h-6 w-6" />,
    accent: 'from-amber-600 to-orange-500',
  },
  {
    id: 'delivery',
    title: 'Delivery & Export',
    description: 'Coordinate logistics, transport and export-ready delivery operations.',
    icon: <Truck className="h-6 w-6" />,
    accent: 'from-rose-600 to-pink-500',
  },
];

export function ServiceProviderTypeSelection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const handleSelect = async (type: string) => {
    localStorage.setItem('serviceProviderType', type);
    const email = localStorage.getItem('userEmail');
    if (email) {
      try {
        await updateServiceProviderType(email, type);
      } catch (error) {
        console.warn('Unable to save provider type to backend', error);
      }
    }
    onNavigate('service-provider-dashboard');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4fff7,_transparent_40%),_linear-gradient(180deg,_#ffffff_0%,_#eef7eb_100%)] p-4 sm:p-6 lg:p-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] border border-green-100/70 bg-white/95 shadow-[0_40px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 rounded-l-[2rem] bg-[radial-gradient(circle_at_top_right,_rgba(77,124,64,0.18),_transparent_50%)] lg:block" />
        <div className="relative grid gap-8 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-12">
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#e7f8e8] via-[#f8faee] to-[#fff7ec] p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)] sm:p-10">
            <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-white/50 blur-3xl" />
            <div className="absolute right-6 top-6 hidden h-32 w-32 rounded-[2rem] bg-[rgba(255,255,255,0.7)] blur-2xl md:block" />
            <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-semibold text-green-800 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              Smart onboarding for service providers
            </div>
            <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Pick your service flow</h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              A warm agricultural experience with glass-like cards, rounded corners and packaging-inspired details for every provider category.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-700">Theme</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Green + white agriculture</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <p className="text-sm uppercase tracking-[0.24em] text-amber-700">Style</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Glassmorphism cards with warm beige accents</p>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 hidden h-40 w-40 md:block">
              <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-[2rem] bg-[#f7eddc] shadow-[0_28px_80px_rgba(229,187,126,0.28)]" />
              <div className="absolute right-8 bottom-8 h-24 w-24 rounded-[2rem] bg-[#ffffff] shadow-[0_18px_40px_rgba(15,23,42,0.12)]" />
            </div>
          </section>

          <section className="space-y-6 rounded-[2rem] bg-white/90 p-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </button>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-900">
                <ShieldCheck className="h-4 w-4" /> Personalized provider portal
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-900">Which service do you provide?</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Select your provider type to unlock the right NagroMS dashboard, widgets, and reports.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {serviceOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/90 p-6 text-left shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-amber-200"
                >
                  <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${option.accent} text-white shadow-lg`}>
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{option.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{option.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-amber-700 transition group-hover:text-amber-900">
                    Open dashboard <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
