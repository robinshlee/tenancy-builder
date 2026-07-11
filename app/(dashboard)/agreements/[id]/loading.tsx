export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-56 bg-white/10 rounded" />
        <div className="h-96 bg-white/10 rounded" />
      </div>
    </div>
  );
}
