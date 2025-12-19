import { Link } from "react-router-dom";
import { ArrowRight, UserPlus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-library-burgundy p-8 md:p-12 lg:p-16">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-80 h-80 border-2 border-white rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 border-2 border-white rounded-full" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Accelerate Your{" "}
              <span className="text-library-gold">Academic Journey</span>?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of students and lecturers who trust DTI Library for their 
              academic resources. Create your free account today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-library-gold text-primary-foreground font-semibold hover:bg-library-gold/90 shadow-lg"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
              <Link to="/browse">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse as Guest
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">15,000+</div>
                <div className="text-sm text-white/70">Active Students</div>
              </div>
              <div className="w-px h-10 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-white/70">Lecturers</div>
              </div>
              <div className="w-px h-10 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">18,000+</div>
                <div className="text-sm text-white/70">Resources</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
