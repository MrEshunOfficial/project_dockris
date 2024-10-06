import React from "react";
import { UserPlus, Settings, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="h-10 w-10" />,
      title: "Sign Up",
      description:
        "Create your account and set your personal goals and preferences.",
    },
    {
      icon: <Settings className="h-10 w-10" />,
      title: "Customize Your Dashboard",
      description:
        "Tailor your interface to focus on the features that matter most to you.",
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Sync Your Life",
      description:
        "Connect your existing calendars, financial accounts, and start optimizing your daily routine.",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">How it Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <Card key={index} data-aos="fade-up" data-aos-delay={index * 100}>
            <CardHeader>
              <div className="mb-4">{step.icon}</div>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{step.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
