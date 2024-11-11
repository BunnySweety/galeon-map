import { useTranslation } from 'react-i18next';
import { Filter, Search, MapPin, Settings } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import SearchFilters from '@/components/filters/SearchFilters';
import StatusFilter from '@/components/filters/StatusFilter';
import RegionFilter from '@/components/filters/RegionFilter';

export const Sidebar = () => {
  const { t } = useTranslation();
  const isOpen = useAppSelector(state => state.ui.isSidebarOpen);

  return (
    <aside className={`
      fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 
      transition-transform duration-300 ease-in-out z-20
      border-r border-gray-200 dark:border-gray-700 w-80
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t('filters')}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Search className="w-4 h-4" />
              {t('search')}
            </h3>
            <SearchFilters />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t('region')}
            </h3>
            <RegionFilter />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('status')}
            </h3>
            <StatusFilter />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            {t('resetFilters')}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;