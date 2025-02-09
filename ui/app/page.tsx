import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-primary">GitGrant</div>
          <Link href="/login">
            <Button>Login with GitHub</Button>
          </Link>
        </div>
      </nav>
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            Reward Open Source Contributors
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A performance-based reward system that makes open source contributions fair and transparent.
          </p>
          <Link href="/login">
            <Button size="lg" className="animate-pulse">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-primary text-2xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start mb-8">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Thank you by GitGrant team</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "💰",
    title: "Smart Grant Allocation",
    description: "Automated reward estimation based on issue priority and complexity.",
  },
  {
    icon: "🔍",
    title: "Code Evaluation",
    description: "Fair assessment of pull requests using advanced analysis.",
  },
  {
    icon: "💸",
    title: "Automated Payouts",
    description: "Seamless reward distribution upon contribution acceptance.",
  },
];

const steps = [
  {
    title: "Connect Your Repository",
    description: "Link your GitHub repository to start rewarding contributors.",
  },
  {
    title: "Set Up Grants",
    description: "Allocate funds and set priorities for issues in your repository.",
  },
  {
    title: "Contributors Get Rewarded",
    description: "Contributors automatically receive rewards when their PRs are merged.",
  },
];