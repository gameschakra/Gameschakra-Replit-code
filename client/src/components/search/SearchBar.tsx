// SEARCH_REFACTOR: New shared SearchBar component for unified search flow
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

type Props = {
  placeholder?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onSubmitNavigate?: boolean; // default true: navigate to /search?q=
};

export default function SearchBar({
  placeholder = "Search games...",
  defaultValue = "",
  autoFocus = false,
  size = "md",
  className = "",
  onSubmitNavigate = true,
}: Props) {
  const [, navigate] = useLocation();
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function doNavigate(term: string) {
    const q = term.trim();
    if (!onSubmitNavigate) return;
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") doNavigate(value);
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full rounded-md bg-[#111827]/90 backdrop-blur-sm text-white placeholder-gray-400 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500/50 transition-all duration-300 px-3 pr-10 hover:bg-[#111827] hover:border-gray-600 ${
          size === "lg" ? "h-12" : size === "sm" ? "h-8 text-sm" : "h-10"
        }`}
        aria-label="Search games"
      />
      <button
        type="button"
        onClick={() => doNavigate(value)}
        aria-label="Submit search"
        className="absolute right-2 top-0 bottom-0 flex items-center justify-center text-gray-300 hover:text-amber-400 focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded outline-none transition-colors duration-200"
      >
        <span className="material-icons text-xl">search</span>
      </button>
    </div>
  );
}