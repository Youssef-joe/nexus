import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">L&D Nexus</span>
            </div>
            <p className="text-white/80 text-sm">
              Connecting organizations with expert Learning & Development professionals worldwide.
            </p>
            <div className="flex space-x-4">
              <Twitter className="h-5 w-5 hover:text-primary-light cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 hover:text-primary-light cursor-pointer transition-colors" />
              <Mail className="h-5 w-5 hover:text-primary-light cursor-pointer transition-colors" />
            </div>
          </div>

          {/* For Organizations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">For Organizations</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/hire-experts" className="hover:text-white transition-colors">Hire Experts</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/success-stories" className="hover:text-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* For Professionals */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">For Professionals</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/join-experts" className="hover:text-white transition-colors">Join as Expert</Link></li>
              <li><Link to="/find-projects" className="hover:text-white transition-colors">Find Projects</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
              <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm text-white/60">
          <p>&copy; 2024 L&D Nexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};