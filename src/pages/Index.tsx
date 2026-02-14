import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import CTASection from "@/components/home/CTASection";
import { Clock, CheckCircle2 } from "lucide-react";

const Index = () => {
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {justRegistered && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                    Account Created Successfully! 🎉
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Please check your email to verify your account. After verification, an administrator will review and approve your account.
                    Once approved, you'll have full access to all library resources. This usually takes 24-48 hours.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-yellow-600 dark:text-yellow-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>You can browse materials as a guest in the meantime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <HeroSection />
        <CategoriesSection />
        <FeaturedSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
