import { useTranslation } from 'react-i18next';
import { Heart, Github } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
      <div className="flex justify-between items-center">
        {/* Credits */}
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
          <span>{t('madeWith')}</span>
          <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
          <span>{t('by')}</span>
          <a 
            href="https://github.com/BunnySweety" 
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-gray-900 dark:hover:text-white"
          >
            BunnySweety
          </a>
          <span>&copy; {currentYear}</span>
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/BunnySweety/hospital-map"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;