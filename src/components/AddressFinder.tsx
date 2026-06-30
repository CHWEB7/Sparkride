type AddressFinderProps = {
  value: string;
  onChange: (address: string) => void;
  label: string;
  placeholder?: string;
  hint?: string;
  inputClass: string;
  labelClass: string;
};

export function AddressFinder({
  value,
  onChange,
  label,
  placeholder = "e.g. 12 High Street, Castleford",
  hint,
  inputClass,
  labelClass,
}: AddressFinderProps) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="text"
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        autoComplete="street-address"
      />
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}
