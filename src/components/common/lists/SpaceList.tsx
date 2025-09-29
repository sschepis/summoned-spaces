import { SpaceCard } from '../SpaceCard';
import { Skeleton } from '../../ui/feedback/Skeleton';
import { EmptyState } from '../../ui/EmptyState';
import { Grid } from '../../ui/Grid';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../ui/navigation/Pagination';
import { Space } from '../../../types/common';
import { Globe } from 'lucide-react';

interface SpaceListProps {
  spaces: Space[];
  onSelect?: (spaceId: string) => void;
  onJoin?: (spaceId: string) => void;
  loading?: boolean;
  loadingCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  layout?: 'grid' | 'list';
  columns?: 1 | 2 | 3 | 4;
  showJoinButton?: boolean;
  showResonance?: boolean;
  showRole?: boolean;
  paginate?: boolean;
  itemsPerPage?: number;
  className?: string;
}

export function SpaceList({ 
  spaces, 
  onSelect,
  onJoin,
  loading = false,
  loadingCount = 6,
  emptyTitle = 'No spaces found',
  emptyDescription = 'Create a new space or discover existing ones',
  layout = 'grid',
  columns = 2,
  showJoinButton = false,
  showResonance = true,
  showRole = false,
  paginate = false,
  itemsPerPage = 12,
  className = '' 
}: SpaceListProps) {
  const pagination = usePagination({
    totalItems: spaces.length,
    itemsPerPage,
    initialPage: 1
  });

  // Get the spaces to display based on pagination
  const displaySpaces = paginate 
    ? spaces.slice(pagination.startIndex, pagination.endIndex)
    : spaces;

  if (loading) {
    const skeletons = Array.from({ length: loadingCount }).map((_, index) => (
      <SpaceCardSkeleton key={index} />
    ));

    return layout === 'grid' ? (
      <Grid cols={columns} className={className}>
        {skeletons}
      </Grid>
    ) : (
      <div className={`space-y-4 ${className}`}>
        {skeletons}
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <EmptyState
        icon={Globe}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  const spaceCards = displaySpaces.map((space) => (
    <SpaceCard
      key={space.id}
      space={space}
      onSelect={onSelect ? () => onSelect(space.id) : undefined}
      onJoin={onJoin}
      showJoinButton={showJoinButton}
      showResonance={showResonance}
      showRole={showRole}
    />
  ));

  return (
    <>
      {layout === 'grid' ? (
        <Grid cols={columns} className={className}>
          {spaceCards}
        </Grid>
      ) : (
        <div className={`space-y-4 ${className}`}>
          {spaceCards}
        </div>
      )}
      
      {paginate && (
        <Pagination
          totalItems={spaces.length}
          itemsPerPage={itemsPerPage}
          currentPage={pagination.currentPage}
          onPageChange={pagination.goToPage}
          className="mt-8"
        />
      )}
    </>
  );
}

// Skeleton loader for SpaceCard
function SpaceCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-start space-x-4 mb-4">
        <Skeleton variant="rounded" width={48} height={48} />
        <div className="flex-1">
          <Skeleton width="70%" height={20} className="mb-2" />
          <Skeleton width="100%" height={16} />
          <Skeleton width="90%" height={16} />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
      </div>
      
      <Skeleton height={8} className="mb-4" />
      
      <div className="flex items-center justify-between">
        <Skeleton width={100} height={16} />
        <Skeleton width={80} height={24} />
      </div>
    </div>
  );
}
