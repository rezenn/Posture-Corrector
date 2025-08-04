import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const plans = [
  {
    title: "Free Plan",
    price: "₹Rs. 0/month",
    description: "Perfect for individuals just getting started with Upryt.",
    features: [
      "1 Personal Workspace",
      "100MB File Storage",
      "Unlimited Digital Marketing",
      "Community Support",
      "Access to Core Tool",
      "Limited Customization Options",
    ]
  },
  {
    title: "Monthly Plan",
    price: "Rs. 350/month",
    description: "Great for regular users who need more flexibility and premium tools.",
    popular: true,
    features: [
      "Unlimited Workspaces",
      "5GB Cloud Storage",
      "Priority Email Support",
      "Full Access to All Features",
      "Monthly Data Backup",
      "Custom Branding",
    ]
  },
  {
    title: "Yearly Plan, Save ₹701 annually! ",
    price: "Rs. 3499/year",
    description: "Best value for teams and professionals who plan to grow with Upryt.",
    features: [
      "2 Months Free (₹701 saved)",
      "10GB Cloud Storage",
      "Early Access to New Features",
      "Dedicated Onboarding Support",
      "Exclusive Webinars & Resources",
    ]
  }
];

export default function PricingPlans() {
  return (
    <div className="min-h-screen w-full bg-white px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, i) => (
          <Card
            key={i}
            className={`relative rounded-xl border-none shadow-sm overflow-hidden ${
              plan.popular ? "bg-blue-950 text-white" : "bg-[#f2f8fc] text-black"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-[#6fd1ff] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
            )}
            <CardContent className="p-6 flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold">{plan.title}</h2>
                <p className="text-sm opacity-80 mt-1">{plan.description}</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{plan.price}</p>
                <span className="text-sm font-medium opacity-70">/Pre Monthly</span>
              </div>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✔</span> {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="ghost"
                className={`mt-auto w-full rounded bg-[#d4e8f7] hover:bg-[#c5e0f3] ${
                  plan.popular ? "bg-white text-blue-950 hover:bg-[#f0f8ff]" : ""
                }`}
              >
                GET STARTED
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
