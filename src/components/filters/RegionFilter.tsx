import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRegion } from '@/store/slices/filtersSlice';
import Select from '@/components/ui/Select';
import { Region } from '@/types/filters';

const regions: Region[] = [
  { value: '', label: 'allRegions' },
  { value: 'Europe', label: 'europe' },
  { value: 'North America', label: 'northAmerica' },
  { value: 'South America', label: 'southAmerica' },
  { value: 'Asia', label: 'asia' },
  { value: 'Africa', label: 'africa' },
  { value: 'Oceania', label: 'oceania' }
];

export const RegionFilter = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selectedRegion = useAppSelector(state => state.filters.region);

  return (
    <div className="space-y-4">
      <Select
        value={selectedRegion}
        onChange={(e) => dispatch(setRegion(e.target.value))}
        aria-label={t('selectRegion')}
      >
        {regions.map(region => (
          <option key={region.value} value={region.value}>
            {t(region.label)}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default RegionFilter;