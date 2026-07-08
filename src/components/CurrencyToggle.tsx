import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const CurrencyToggle = () => {
  const { currencyMode, setCurrencyMode, currencyNotice } = useLanguage();
  const [showTip, setShowTip] = useState(false);

  const toggle = () => setCurrencyMode(currencyMode === "USD" ? "EUR" : "USD");

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {showTip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap max-w-[240px] text-[10px] leading-tight bg-foreground text-background px-2 py-1 rounded-md shadow-md z-[80]">
          <span className="block whitespace-normal text-center">{currencyNotice}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-foreground" />
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
        aria-label="Toggle currency USD / EUR"
        className="inline-flex items-center h-8 rounded-full border border-border bg-background text-[11px] font-medium tracking-wider overflow-hidden hover:border-primary/50 transition-colors"
      >
        <span
          className={`px-2 py-1 transition-colors ${
            currencyMode === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          USD
        </span>
        <span
          className={`px-2 py-1 transition-colors ${
            currencyMode === "EUR" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          EUR
        </span>
      </button>
    </div>
  );
};
