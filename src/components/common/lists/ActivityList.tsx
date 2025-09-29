import { ActivityCard } from '../ActivityCard';
import { Skeleton } from '../../ui/feedback/Skeleton';
import { EmptyState } from '../../ui/EmptyState';
import { Pagination } from '../../ui/navigation/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import { ActivityItem } from '../../../types/common';
import { Activity } from 'lucide-react';

interface ActivityListProps {
  activities: ActivityItem[];
  onLike?: (activityId: string) => void;
  onBookmark?: (activityId: string) => void;
  onFollow?: (userId: string) => void;
  onAction?: (action: string, activityId: string) => void;
  loading?: boolean;
  loadingCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  showFollowButton?: boolean;
  compact?: boolean;
  paginate?: boolean;
  itemsPerPage?: number;
  className?: string;
}

export function ActivityList({ 
  activities, 
  onLike,
  onBookmark,
  onFollow,
  onAction,
  loading = false,
  loadingCount = 5,
  emptyTitle = 'No activity yet',
  emptyDescription = 'When there\'s activity, it will appear here',
  showFollowButton = true,
  compact = false,
  paginate = false,
  itemsPerPage = 20,
  className = '' 
}: ActivityListProps) {
  const pagination = usePagination({
    totalItems: activities.length,
    itemsPerPage,
    initialPage: 1
  });

  // Get the activities to display based on pagination
  const displayActivities = paginate 
    ? activities.slice(pagination.startIndex, pagination.endIndex)
    : activities;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <ActivityCardSkeleton key={index} compact={compact} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-${compact ? '2' : '4'} ${className}`}>
      {displayActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onLike={onLike}
          onBookmark={onBookmark}
          onFollow={onFollow}
          showFollowButton={showFollowButton}
          compact={compact}
        />
      ))}
      
      {paginate && (
        <Pagination
          totalItems={activities.length}
          itemsPerPage={itemsPerPage}
          currentPage={pagination.currentPage}
          onPageChange={pagination.goToPage}
          className="mt-8"
        />
      )}
    </div>
  );
}

// Skeleton loader for ActivityCard
interface ActivityCardSkeletonProps {
  compact?: boolean;
}

function ActivityCardSkeleton({ compact = false }: ActivityCardSkeletonProps) {
  if (compact) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1">
            <Skeleton width="80%" height={16} />
          </div>
          <Skeleton width={60} height={16} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" width={48} height={48} />
          <div>
            <Skeleton width={120} height={20} className="mb-1" />
            <Skeleton width={200} height={16} />
          </div>
        </div>
        <Skeleton width={80} height={32} />
      </div>
      
      {/* Content */}
      <div className="mb-4">
        <Skeleton width="100%" height={20} className="mb-2" />
        <Skeleton width="90%" height={16} />
        <Skeleton width="95%" height={16} />
      </div>
      
      {/* Media placeholder */}
      <Skeleton variant="rounded" width="100%" height={200} className="mb-4" />
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-6">
          <Skeleton width={60} height={20} />
          <Skeleton width={60} height={20} />
          <Skeleton width={60} height={20} />
        </div>
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  );
}

// View mode selector for activity feeds
interface ViewModeSelectorProps {
  mode: 'card' | 'compact' | 'minimal';
  onChange: (mode: 'card' | 'compact' | 'minimal') => void;
  className?: string;
}

export function ViewModeSelector({ mode, onChange, className = '' }: ViewModeSelectorProps) {
  const modes = [
    { id: 'card', label: 'Cards', icon: '▦' },
    { id: 'compact', label: 'Compact', icon: '☰' },
    { id: 'minimal', label: 'Minimal', icon: '⋯' }
  ] as const;

  return (
    <div className={`flex items-center space-x-1 bg-white/10 rounded-lg p-1 ${className}`}>
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            mode === m.id
              ? 'bg-cyan-500/20 text-cyan-300'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <span className="mr-2">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}