interface LogoProps {
  className?: string;
  variant?: 'default' | 'small' | 'large' | 'icon-only';
}

export const Logo = ({ className = '', variant = 'default' }: LogoProps) => {
  const getLogoPath = () => {
    switch (variant) {
      case 'small':
        return '/icon-small.jpeg'; // For small spaces
      case 'large':
        return '/icon-large.jpeg'; // For hero sections
      case 'icon-only':
        return '/icon-only.jpeg'; // Just the icon without text
      default:
        return '/icon.jpeg'; // Default logo
    }
  };

  const getSize = () => {
    switch (variant) {
      case 'small':
        return 'h-6 w-6';
      case 'large':
        return 'h-16 w-auto max-w-48';
      case 'icon-only':
        return 'h-8 w-8';
      default:
        return 'h-10 w-10';
    }
  };

  return (
    <img
      src={getLogoPath()}
      alt="L&D Nexus Logo"
      className={`${getSize()} object-contain ${className}`}
      onError={(e) => {
        // Fallback to default if specific variant doesn't exist
        const target = e.target as HTMLImageElement;
        if (target.src !== '/icon.jpeg') {
          target.src = '/icon.jpeg';
        }
      }}
    />
  );
};