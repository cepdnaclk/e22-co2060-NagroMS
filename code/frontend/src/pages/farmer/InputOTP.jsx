// InputOTP.jsx
export function InputOTP({ value, onChange, length = 4 }) {
  return (
    <input
      type="text"
      maxLength={length}
      value={value}
      onChange={onChange}
      className="border rounded px-2 py-1 w-16 text-center"
      placeholder={'-'.repeat(length)}
    />
  );
}

// Optional: if you used InputOTPGroup / InputOTPSlot, make simple placeholders
export function InputOTPGroup({ children }) {
  return <div className="flex gap-2">{children}</div>;
}

export function InputOTPSlot({ value, onChange }) {
  return (
    <input
      type="text"
      maxLength={1}
      value={value}
      onChange={onChange}
      className="border rounded w-10 text-center"
    />
  );
}
