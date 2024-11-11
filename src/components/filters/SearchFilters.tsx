import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAppDispatch } from '@/store/hooks';
import { setSearchFilters } from '@/store/slices/filtersSlice';
import Input from '@/components/ui/Input';

export const SearchFilters = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const debouncedSearch = useDebounce((value: string) => {
    dispatch(setSearchFilters({ searchTerm: value }));
  }, 300);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleClear = useCallback((type: 'search' | 'country' | 'city') => {
    switch (type) {
      case 'search':
        setSearchTerm('');
        dispatch(setSearchFilters({ searchTerm: '' }));
        break;
      case 'country':
        setCountryFilter('');
        dispatch(setSearchFilters({ country: '' }));
        break;
      case 'city':
        setCityFilter('');
        dispatch(setSearchFilters({ city: '' }));
        break;
    }
  }, [dispatch]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
          leftIcon={<Search className="w-4 h-4 text-gray-400" />}
          rightIcon={
            searchTerm && (
              <button
                onClick={() => handleClear('search')}
                className="text-gray-400 hover:text-gray-500"
                aria-label={t('clear')}
              >
                <X className="w-4 h-4" />
              </button>
            )
          }
        />
      </div>

      {/* Country Filter */}
      <div className="relative">
        <Input
          value={countryFilter}
          onChange={(e) => {
            setCountryFilter(e.target.value);
            dispatch(setSearchFilters({ country: e.target.value }));
          }}
          placeholder={t('countryPlaceholder')}
          rightIcon={
            countryFilter && (
              <button
                onClick={() => handleClear('country')}
                className="text-gray-400 hover:text-gray-500"
                aria-label={t('clear')}
              >
                <X className="w-4 h-4" />
              </button>
            )
          }
        />
      </div>

      {/* City Filter */}
      <div className="relative">
        <Input
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value);
            dispatch(setSearchFilters({ city: e.target.value }));
          }}
          placeholder={t('cityPlaceholder')}
          rightIcon={
            cityFilter && (
              <button
                onClick={() => handleClear('city')}
                className="text-gray-400 hover:text-gray-500"
                aria-label={t('clear')}
              >
                <X className="w-4 h-4" />
              </button>
            )
          }
        />
      </div>
    </div>
  );
};

export default SearchFilters;