import { Skeleton } from "@/components/ui/skeleton";

const MaterialCardSkeleton = () => {
  return (
    <div className="book-card bg-card overflow-hidden">
      {/* Header skeleton */}
      <Skeleton className="h-32 w-full rounded-none" />
      
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-4/5" />
        
        {/* Author skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Meta info skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        
        {/* Badge skeleton */}
        <Skeleton className="h-5 w-24 rounded-full" />
        
        {/* Buttons skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    </div>
  );
};

export const MaterialCardSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <MaterialCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default MaterialCardSkeleton;
