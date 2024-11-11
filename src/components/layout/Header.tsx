import { useTranslation } from 'react-i18next';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export const Header = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="h-full flex items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label={t('toggleSidebar')}
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            {t('appName')}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <LanguageSelector />
          
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label={t('toggleTheme')}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {t('welcome')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;