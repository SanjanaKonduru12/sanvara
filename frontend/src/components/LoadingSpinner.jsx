export default function LoadingSpinner({ inline = false }) {
  if (inline) {
    return <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />;
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
    </div>
  );
}
