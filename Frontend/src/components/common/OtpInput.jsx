import React, { useRef, useEffect, useCallback, memo } from "react";

const OtpInput = memo(({ otp, setOtp, length = 6 }) => {
  const inputRefs = useRef([]);

  // Auto-focus the first OTP input box on initial mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handles character entry & replacing digits
  const handleChange = useCallback(
    (e, index) => {
      const val = e.target.value;
      const digitsOnly = val.replace(/\D/g, ""); // Restrict to numbers only

      // If user clears input
      if (!digitsOnly) {
        setOtp((prevOtp) => {
          const newOtp = [...prevOtp];
          newOtp[index] = "";
          return newOtp;
        });
        return;
      }

      // Handle multi-character input (SMS Auto-fill or fast typing)
      if (digitsOnly.length > 1) {
        const digits = digitsOnly.slice(0, length).split("");
        setOtp((prevOtp) => {
          const newOtp = [...prevOtp];
          digits.forEach((char, i) => {
            if (i < length) newOtp[i] = char;
          });
          return newOtp;
        });

        const focusIndex = Math.min(digits.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
        return;
      }

      // Single digit entry (overwrites existing digit thanks to auto-selection)
      const newDigit = digitsOnly.slice(-1);
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[index] = newDigit;
        return newOtp;
      });

      // Automatically advance to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [length, setOtp]
  );

  // Keyboard navigation: Backspace & Arrow keys
  const handleKeyDown = useCallback(
    (e, index) => {
      if (e.key === "Backspace") {
        if (!otp[index] && index > 0) {
          // If current field is empty, move back and clear previous field
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp, length]
  );

  // Paste 6-digit OTP from anywhere
  const handlePaste = useCallback(
    (e, index) => {
      e.preventDefault();
      const pastedDigits = e.clipboardData.getData("text").replace(/\D/g, "");
      if (!pastedDigits) return;

      // If a full 6-digit code is pasted, start from box 0; otherwise start from current box
      const startIndex = pastedDigits.length >= length ? 0 : index;
      const digitsToUse = pastedDigits.slice(0, length - startIndex).split("");

      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        digitsToUse.forEach((char, i) => {
          if (startIndex + i < length) {
            newOtp[startIndex + i] = char;
          }
        });
        return newOtp;
      });

      const focusIndex = Math.min(startIndex + digitsToUse.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    },
    [length, setOtp]
  );

  // Auto-select digit on focus to allow instant typing replacement
  const handleFocus = useCallback((e) => {
    e.target.select();
  }, []);

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          onFocus={handleFocus}
          className="w-10 h-11 text-center text-lg font-semibold border border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
        />
      ))}
    </div>
  );
});

OtpInput.displayName = "OtpInput";

export default OtpInput;