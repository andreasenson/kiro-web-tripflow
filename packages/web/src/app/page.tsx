import Link from 'next/link';

const features = [
  {
    icon: '🤖',
    title: 'AI Itinerary Generation',
    description:
      'Get personalized day-by-day itineraries crafted by AI based on your preferences, budget, and travel style.',
  },
  {
    icon: '💰',
    title: 'Budget Tracking',
    description:
      'Set budgets, log expenses, and monitor spending in real time so you never overspend on a trip.',
  },
  {
    icon: '📡',
    title: 'Offline-First',
    description:
      'Access your itinerary, maps, and trip details even without an internet connection.',
  },
  {
    icon: '📍',
    title: 'Day-of Travel Mode',
    description:
      'A focused daily view that shows exactly what is planned for today, with directions and timing.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Plan Smarter.{' '}
            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              Travel Better.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
            TripFlow is your AI-powered travel companion that helps you plan,
            budget, and navigate every trip with ease.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/trips"
              className="inline-flex items-center rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for the perfect trip
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From planning to exploring, TripFlow has you covered.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition-colors group-hover:bg-blue-100">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to plan your next adventure?
          </h2>
          <p className="mt-4 text-gray-400">
            Start organizing your trips today with AI-powered suggestions.
          </p>
          <Link
            href="/trips/new"
            className="mt-8 inline-flex items-center rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow transition-all hover:bg-blue-500 hover:shadow-lg hover:-translate-y-0.5"
          >
            Create Your First Trip
          </Link>
        </div>
      </section>
    </div>
  );
}
