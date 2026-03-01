interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export default function ToggleSwitch({ checked, onChange, label, disabled }: Props) {
  return (
    <label className={`flex items-center justify-between gap-3 py-1.5 cursor-pointer ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <span className="text-sm text-gray-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200
          focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060c]
          ${checked ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]" : "bg-white/10"}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200
            ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
        />
      </button>
    </label>
  );
}
