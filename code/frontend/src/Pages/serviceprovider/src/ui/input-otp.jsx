import * as React from "react";

const InputOTPContext = React.createContext({});

function InputOTP({ maxLength, value, onChange, children, ...props }) {
  const [internalValue, setInternalValue] = React.useState(value || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (newValue) => {
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <InputOTPContext.Provider value={{ value: internalValue, onChange: handleChange, maxLength }}>
      <div className="flex items-center gap-2" {...props}>
        {children}
      </div>
    </InputOTPContext.Provider>
  );
}

function InputOTPGroup({ children, ...props }) {
  return (
    <div className="flex items-center gap-2" {...props}>
      {children}
    </div>
  );
}

function InputOTPSlot({ index, className, ...props }) {
  const context = React.useContext(InputOTPContext);
  const inputRef = React.useRef(null);
  
  if (!context) {
    throw new Error("InputOTPSlot must be used within InputOTP");
  }

  const { value, onChange, maxLength } = context;
  const char = value[index] || "";

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChange(newValue);
      
      // Focus previous input
      if (index > 0) {
        const prevInput = inputRef.current?.parentElement?.previousElementSibling?.querySelector('input');
        if (prevInput) prevInput.focus();
      }
    } else if (e.key.length === 1 && /^[0-9]$/.test(e.key)) {
      e.preventDefault();
      if (value.length < maxLength) {
        const newValue = value.slice(0, index) + e.key + value.slice(index + 1);
        onChange(newValue);
        
        // Focus next input
        if (index < maxLength - 1) {
          const nextInput = inputRef.current?.parentElement?.nextElementSibling?.querySelector('input');
          if (nextInput) nextInput.focus();
        }
      }
    }
  };

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div onClick={handleClick} className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={char}
        onChange={() => {}} // Handled by keydown
        onKeyDown={handleKeyDown}
        className={`w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${className || ''}`}
        {...props}
      />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot };
