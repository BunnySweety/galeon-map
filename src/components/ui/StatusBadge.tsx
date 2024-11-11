import { cn } from '@/utils/cn';
import { HospitalStatus } from '@/types/hospital';

interface StatusBadgeProps {
  status: HospitalStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusStyles = {
  Deployed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  'In Progress': "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Signed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
} as const;

const sizeStyles = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
  lg: "text-base px-3 py-1"
} as const;

export const StatusBadge = ({ 
  status, 
  size = 'md',
  className 
}: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    >
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-1.5",
        {
          'Deployed': "bg-green-600",
          'In Progress': "bg-yellow-600",
          'Signed': "bg-blue-600"
        }[status]
      )} />
      {status}
    </span>
  );
};

export default StatusBadge;