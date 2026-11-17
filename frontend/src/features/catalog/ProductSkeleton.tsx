export function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-video bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-200" />
        <div className="mt-3 h-8 w-full rounded bg-gray-200" />
      </div>
    </div>
  );
}