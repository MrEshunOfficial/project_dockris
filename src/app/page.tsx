"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  ChevronRight,
  X,
  DollarSign,
  ShoppingCart,
  MessageCircle,
  Menu,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Card className="h-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <Icon className="h-8 w-8 text-blue-500 dark:text-blue-400 mb-2" />
        <CardTitle className="text-slate-800 dark:text-slate-200">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-slate-600 dark:text-slate-400">
        {description}
      </CardContent>
    </Card>
  </motion.div>
);

interface PricingTierProps {
  title: string;
  price: string;
  features: string[];
}

const PricingTier: React.FC<PricingTierProps> = ({
  title,
  price,
  features,
}) => (
  <Card className=" bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mt-4">
    <CardHeader>
      <CardTitle className="text-slate-800 dark:text-slate-200">
        {title}
      </CardTitle>
      <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">
        {price}
      </p>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
            <span className="text-slate-600 dark:text-slate-400">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </CardContent>
    <Button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
      Choose {title}
    </Button>
  </Card>
);

const LandingPage: React.FC = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { data: session } = useSession();

  const { profile } = useSelector((state: RootState) => state.userProfile);

  const features = [
    {
      icon: Calendar,
      title: "Advanced Scheduling",
      description:
        "Plan your daily tasks, special events, appointments, and routines with calendar view options.",
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description:
        "Track income, expenses, manage debts, and create budgets to stay on top of your finances.",
    },
    {
      icon: ShoppingCart,
      title: "Shopping Features",
      description:
        "Create shopping lists, track prices, and manage your purchases effortlessly.",
    },
    {
      icon: MessageCircle,
      title: "Chat Features",
      description:
        "Collaborate with team members or chat with AI assistants for productivity tips.",
    },
  ];

  const pricingTiers = [
    {
      title: "Free",
      price: "$0/month",
      features: [
        "Basic task management",
        "Limited calendar views",
        "Basic financial tracking",
        "Community chat access",
      ],
    },
    {
      title: "Classic",
      price: "$9.99/month",
      features: [
        "Advanced task management",
        "Full calendar functionality",
        "Comprehensive financial tools",
        "Shopping list creation",
        "Group chat features",
      ],
    },
    {
      title: "Premium",
      price: "$19.99/month",
      features: [
        "All Classic features",
        "AI-powered scheduling",
        "Investment tracking",
        "Price comparison for shopping",
        "AI chat assistant",
        "Priority support",
      ],
    },
  ];

  return (
    <div className="h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="shadow-md dark:shadow-slate-700 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-blue-600 dark:text-blue-400"
          >
            PlanZen
          </motion.h1>
          <nav className="hidden md:flex space-x-4">
            <Button
              variant="ghost"
              className="text-slate-700 dark:text-slate-300"
            >
              Pricing
            </Button>
            {!session && (
              <div className="w-full flex items-center justify-center gap-2">
                <Button variant={"link"}>
                  <Link href={"/authclient/Login"}>Login</Link>
                </Button>
                <Button variant={"link"}>
                  <Link href={"/authclient/Register"}>Sign Up</Link>
                </Button>
              </div>
            )}
            {session ? (
              <Button>
                <Link href={"/Features"}>Open Calendar</Link>
              </Button>
            ) : (
              <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                Get Started
              </Button>
            )}
          </nav>
          <Button
            variant="ghost"
            className="md:hidden text-slate-700 dark:text-slate-300"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-700 z-50 p-6"
          >
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-slate-700 dark:text-slate-300"
              onClick={() => setIsMenuOpen(false)}
            >
              <X />
            </Button>
            <nav className="flex flex-col space-y-4 mt-12">
              <Button
                variant="ghost"
                className="text-slate-700 dark:text-slate-300"
              >
                Features
              </Button>
              <Button
                variant="ghost"
                className="text-slate-700 dark:text-slate-300"
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                className="text-slate-700 dark:text-slate-300"
              >
                About
              </Button>
              {!session && (
                <div className="w-full flex items-center justify-center gap-2">
                  <Button variant={"link"}>
                    <Link href={"/authclient/Login"}>Login</Link>
                  </Button>
                  <Button variant={"link"}>
                    <Link href={"/authclient/Register"}>Sign Up</Link>
                  </Button>
                </div>
              )}
              {session ? (
                <Button>
                  <Link href={"/Feature/Calendar"}>Open Calendar</Link>
                </Button>
              ) : (
                <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4">
        <section className="py-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl font-bold mb-6 text-slate-900 dark:text-slate-100"
          >
            Boost Your Productivity with PlanZen
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl mb-8 text-slate-700 dark:text-slate-300"
          >
            Organize, prioritize, and achieve your goals with ease.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-x-4"
          >
            <Button
              size="lg"
              onClick={() => setIsVideoPlaying(true)}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
            >
              Watch Demo <ChevronRight className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-slate-800"
            >
              Start Free Trial
            </Button>
          </motion.div>
        </section>

        <section className="py-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-slate-200">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        <section className="py-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-800 dark:text-slate-200">
            Pricing Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <PricingTier
                key={index}
                title={tier.title}
                price={tier.price}
                features={tier.features}
              />
            ))}
          </div>
        </section>

        <section className="py-8 text-center bg-blue-50 dark:bg-slate-800 rounded-lg shadow-inner">
          <h3 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-200">
            Ready to Zen Your Plan?
          </h3>
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          >
            Start Your Free Trial <ChevronRight className="ml-2" />
          </Button>
        </section>
      </main>

      <footer className="bg-slate-800 dark:bg-slate-950 text-slate-200 p-6 mt-20">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4">PlanZen</h4>
            <p>Boost your productivity and achieve your goals with ease.</p>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-300">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-300">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-300">
                <svg
                  className="h-6 w-6 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="hover:text-blue-300">
                <svg
                  className="h-6 w-6 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
                </svg>
              </a>
              <a href="#" className="hover:text-blue-300">
                <svg
                  className="h-6 w-6 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          © {new Date().getFullYear()} PlanZen. All rights reserved.
        </div>
      </footer>

      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                className="absolute top-2 right-2 text-slate-500 dark:text-slate-400"
                onClick={() => setIsVideoPlaying(false)}
              >
                <X />
              </Button>
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="PlanZen Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {session && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={
                  profile?.profilePicture || session?.user?.image || undefined
                }
              />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {profile?.username || session?.user?.name || null}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {profile?.email || session?.user?.email || null}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
