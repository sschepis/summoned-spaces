import { UserCard } from '../UserCard';
import { Skeleton, SkeletonGroup } from '../../ui/feedback/Skeleton';
import { EmptyState } from '../../ui/EmptyState';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../ui/navigation/Pagination';
import { User } from '../../../types/common';
import { Users } from 'lucide-react';

interface UserListProps {
  users: User[];
  onFollow: (userId: string) => void;
  loading?: boolean;
  loadingCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  showStats?: boolean;
  showActivity?: boolean;
  showTags?: boolean;
  paginate?: boolean;
  itemsPerPage?: number;
  className?: string;
}

export function UserList({ 
  users, 
  onFollow,
  loading = false,
  loadingCount = 3,
  emptyTitle = 'No users found',
  emptyDescription = 'Try adjusting your search or filters',
  showStats = true,
  showActivity = true,
  showTags = true,
  paginate = false,
  itemsPerPage = 10,
  className = '' 
}: UserListProps) {
  const pagination = usePagination({
    totalItems: users.length,
    itemsPerPage,
    initialPage: 1
  });

  // Get the users to display based on pagination
  const displayUsers = paginate 
    ? users.slice(pagination.startIndex, pagination.endIndex)
    : users;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <UserCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {displayUsers.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onFollow={onFollow}
          showStats={showStats}
          showActivity={showActivity}
          showTags={showTags}
        />
      ))}
      
      {paginate && (
        <Pagination
          totalItems={users.length}
          itemsPerPage={itemsPerPage}
          currentPage={pagination.currentPage}
          onPageChange={pagination.goToPage}
          className="mt-8"
        />
      )}
    </div>
  );
}

// Skeleton loader for UserCard
function UserCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-start space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton width="60%" height={20} className="mb-2" />
          <Skeleton width="40%" height={16} className="mb-4" />
          <SkeletonGroup count={3}>
            <Skeleton width="100%" height={14} />
          </SkeletonGroup>
        </div>
      </div>
    </div>
  );
}
