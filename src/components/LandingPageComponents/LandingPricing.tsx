import React from "react";
import { CreditCard, Shield, Award, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LandingPricing = () => {
  const plans = [
    {
      title: "Free",
      price: "$0.00/month",
      features: [
        "Smart Scheduling",
        "Basic Habit Tracking",
        "Simple Budget Tool",
        "Shopping List Creation",
      ],
      icon: <CreditCard className="h-10 w-10" />,
    },
    {
      title: "Pro",
      price: "$19.99/month",
      features: [
        "All Basic features",
        "Advanced Habit Analytics",
        "Comprehensive Financial Planning",
        "AI-Powered Shopping Suggestions",
        "Community Access",
      ],
      icon: <Shield className="h-10 w-10" />,
    },
    {
      title: "Enterprise",
      price: "Custom Pricing",
      features: [
        "All Pro features",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Team Collaboration Tools",
        "Priority Support",
      ],
      icon: <Award className="h-10 w-10" />,
    },
  ];

  return (
    <section className=" py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} data-aos="zoom-in" data-aos-delay={index * 100}>
              <CardHeader>
                <div className=" mb-4">{plan.icon}</div>
                <CardTitle className="text-teal-950">{plan.title}</CardTitle>
                <CardDescription className="text-2xl font-bold ">
                  {plan.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4">Choose Plan</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
