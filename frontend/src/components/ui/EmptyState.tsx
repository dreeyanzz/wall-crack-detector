interface Props {
  icon: string;
  message: string;
}

export default function EmptyState({ icon, message }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-gray-500 select-none">
      <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}
