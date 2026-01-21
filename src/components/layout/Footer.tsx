import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import dtiLogo from '@/assets/dti-logo.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src={dtiLogo} 
                alt="DTI Library Logo" 
                className="h-12 w-12 object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-bold text-primary-foreground">DTI Library</span>
                <span className="text-[10px] text-primary-foreground/70 tracking-wider uppercase">
                  Destination Training Institute
                </span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              DESTINATION TRAINING INSTITUTE - Your academic companion for accessing books, lecture notes, tutorials, 
              and past papers. Empowering students and educators alike.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/browse"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Browse Materials
                </Link>
              </li>
              <li>
                <Link 
                  to="/tutorials"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link 
                  to="/past-papers"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Past Papers
                </Link>
              </li>
              <li>
                <Link 
                  to="/about"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/books"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Books
                </Link>
              </li>
              <li>
                <Link 
                  to="/lecture-notes"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Lecture Notes
                </Link>
              </li>
              <li>
                <Link 
                  to="/past-papers"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Past Papers
                </Link>
              </li>
              <li>
                <Link 
                  to="/tutorials"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link 
                  to="/register"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>DTI Campus, Main Library Building</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:library@dti.edu" className="hover:text-primary-foreground transition-colors">
                  library@dti.edu
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} DESTINATION TRAINING INSTITUTE Library. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
