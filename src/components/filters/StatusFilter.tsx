import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleStatus } from '@/store/slices/filtersSlice';
import { HospitalStatus } from '@/types/hospital';

const statusColors = {
  Deployed: 'bg-green-500 hover:bg-green-600',
  'In Progress': 'bg-yellow-500 hover:bg-yellow-600',
  Signed: 'bg-blue-500 hover:bg-blue-600'
} as const;

export const StatusFilter = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeStatuses = useAppSelector(state => state.filters.statuses);

  const handleStatusToggle = (status: HospitalStatus) => {
    dispatch(toggleStatus(status));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(statusColors) as HospitalStatus[]).map(status => (
        <button
          key={status}
          onClick={() => handleStatusToggle(status)}
          className={`
            px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${activeStatuses.includes(status)
              ? `${statusColors[status]} text-white`
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
          `}
          aria-pressed={activeStatuses.includes(status)}
        >
          {t(`status.${status}`)}
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;