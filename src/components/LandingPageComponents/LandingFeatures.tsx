import React from "react";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LandingFeatures = () => {
  const featuresList = [
    {
      icon: <Calendar className="h-10 w-10" />,
      title: "Smart Scheduling",
      description:
        "Smart Scheduling, Daily to-dos, Event planning & Appointment booking",
    },
    {
      icon: <TrendingUp className="h-10 w-10" />,
      title: "Habit Tracking",
      description:
        "Visualize progress, set milestones, and join habit-forming challenges.",
    },
    {
      icon: <DollarSign className="h-10 w-10" />,
      title: "Financial Management",
      description:
        "Comprehensive budgeting tools, expense and income categorization and tracking, financial goal setting, and many more offers",
    },
    {
      icon: <ShoppingCart className="h-10 w-10" />,
      title: "Smart Shopping Lists",
      description:
        "AI-suggested items, price comparison, and shared household lists, track prices on wish list and window-shopping items",
    },
    {
      icon: <MessageCircle className="h-10 w-10" />,
      title: "Community Connection",
      description:
        "Goal-oriented social network, progress sharing, accountability partnerships, connect and chat with peers, share files, budgets, list and many more",
    },
  ];

  return (
    <section className=" py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => (
            <Card key={index} data-aos="flip-left" data-aos-delay={index * 100}>
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
