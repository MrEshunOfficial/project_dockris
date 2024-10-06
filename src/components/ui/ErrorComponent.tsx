import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2, RefreshCcw, Mail } from "lucide-react";
import Link from "next/link";

const ErrorComponent: React.FC<{ error: string }> = ({ error }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (isLoading && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isLoading && countdown === 0) {
      window.location.reload();
    }
  }, [isLoading, countdown]);

  const handleRetry = () => {
    setIsLoading(true);
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-red-100 to-orange-200 dark:from-gray-900 dark:to-red-900 transition-all duration-500 ease-in-out p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-all duration-500 ease-in-out">
        <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="w-20 h-20 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
            {`Oops! We've hit a snag.`}
          </h1>
          <p className="text-xl text-center mb-8 text-gray-600 dark:text-gray-300">
            {`We're having trouble completing your request. Don't worry, it's not
            you - it's us.`}
          </p>
          <div
            className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-8"
            role="alert"
          >
            <p className="font-bold">Error details:</p>
            <p>
              {error}
              {showContactForm && (
                <div className="flex flex-col items-center space-y-2">
                  <p>
                    {`  If you're experiencing issues with your account, please contact us
                    at:`}
                  </p>
                  <Link
                    href="mailto:support@example.com"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Mail className="w-5 h-5" />
                    support@example.com
                  </Link>
                </div>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className={`w-full sm:w-auto px-6 py-3 rounded-full shadow-lg transition-all duration-300 text-white flex items-center justify-center space-x-2 ${
                isLoading
                  ? "bg-blue-400 dark:bg-blue-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Retrying in {countdown}s</span>
                </>
              ) : (
                <>
                  <RefreshCcw className="w-5 h-5" />
                  <span>Try Again</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="w-full sm:w-auto px-6 py-3 rounded-full shadow-lg transition-all duration-300 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex items-center justify-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Support</span>
            </button>
          </div>
        </div>
        {showContactForm && (
          <div className="p-8 bg-gray-100 dark:bg-gray-700 transition-all duration-500 ease-in-out">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Contact Support
            </h2>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Your email"
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
              <textarea
                placeholder="Describe the issue"
                rows={4}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              ></textarea>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-full shadow-lg transition-all duration-300 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
              >
                Send Message
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorComponent;
