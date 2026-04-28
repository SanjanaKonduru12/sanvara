export default function MoodCard({ mood, onSelect }) {
  const badge = mood.icon && mood.icon.length <= 3 ? mood.icon : mood.name.slice(0, 2).toUpperCase();

  return (
    <button
      type="button"
      onClick={() => onSelect(mood)}
      className="group surface-card flex w-full flex-col items-start gap-4 p-5 text-left transition duration-300 hover:-translate-y-1.5"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
        {badge}
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--color-text)]">{mood.name}</p>
        <p className="mt-1 text-sm text-[var(--color-text-soft)]">{mood.description}</p>
      </div>
    </button>
  );
}
