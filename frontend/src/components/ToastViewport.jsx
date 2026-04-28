const toneStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100',
  error: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
};

export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:px-8">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto ml-auto w-full max-w-sm rounded-3xl border px-4 py-4 shadow-soft backdrop-blur ${toneStyles[toast.tone] || toneStyles.info}`}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.message && <p className="mt-1 text-sm opacity-90">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-full px-2 py-1 text-xs font-semibold transition hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
