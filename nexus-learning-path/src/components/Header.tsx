import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuthStore } from '@/store/authStore';
import { User, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <Logo variant="large" className="h-12 w-auto" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-foreground hover:text-primary transition-colors"
          >
            {t('navigation.home')}
          </Link>
          <Link 
            to="/about" 
            className="text-foreground hover:text-primary transition-colors"
          >
            {t('navigation.about')}
          </Link>
          <Link 
            to="/services" 
            className="text-foreground hover:text-primary transition-colors"
          >
            {t('navigation.services')}
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block">{user.firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')}
                  className="cursor-pointer"
                >
                  {t('navigation.dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer"
                >
                  {t('navigation.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/messages')}
                  className="cursor-pointer"
                >
                  {t('navigation.messages')}
                </DropdownMenuItem>
                {user.role === 'professional' && (
                  <DropdownMenuItem 
                    onClick={() => navigate('/recommended')}
                    className="cursor-pointer text-blue-600 font-medium"
                  >
                    AI Recommendations
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem 
                    onClick={() => navigate('/admin')}
                    className="cursor-pointer text-red-600 font-semibold"
                  >
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('navigation.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 rtl:space-x-reverse">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
              >
                {t('navigation.login')}
              </Button>
              <Button 
                onClick={() => navigate('/signup')}
                variant="hero"
              >
                {t('navigation.signup')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};