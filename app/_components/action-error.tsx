export function ActionError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="animate-fade-in rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg"
    >
      {message}
    </p>
  );
}
