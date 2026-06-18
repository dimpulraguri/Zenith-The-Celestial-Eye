"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, Loader2, X, Navigation } from "lucide-react";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { debounce } from "@/utils/formatting";
import type { LocationData } from "@/types";

export function LocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { location, recentLocations, setLocation } = useLocationStore();
  const { searchLocation, detectLocation } = useGeolocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = debounce(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const found = await searchLocation(q);
    setResults(found);
    setIsSearching(false);
  }, 400);

  const handleChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    if (value.length >= 2) {
      setIsSearching(true);
      doSearch(value);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  };

  const handleSelect = (loc: LocationData) => {
    setLocation(loc);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleDetect = async () => {
    setIsSearching(true);
    await detectLocation();
    setIsSearching(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Search input */}
      <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 focus-within:border-purple-500/50 transition-all border border-white/8">
        <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={location.name}
          className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
          aria-label="Search location"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />
        {isSearching ? (
          <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin shrink-0" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 glass-strong rounded-xl overflow-hidden z-50 border border-white/10"
            role="listbox"
            aria-label="Location suggestions"
          >
            {/* Detect location button */}
            <button
              onClick={handleDetect}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/5 transition-colors border-b border-white/5"
              aria-label="Use current location"
            >
              <Navigation className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-300">Use current location</span>
            </button>

            {/* Search results */}
            {results.length > 0 && (
              <div>
                <div className="px-3 py-1 text-xs text-slate-600 uppercase tracking-wide border-b border-white/5">
                  Results
                </div>
                {results.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(loc)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/5 transition-colors"
                    role="option"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-300 truncate">{loc.name}</span>
                    {loc.country && (
                      <span className="text-slate-600 shrink-0">{loc.country}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Recent locations */}
            {!query && recentLocations.length > 0 && (
              <div>
                <div className="px-3 py-1 text-xs text-slate-600 uppercase tracking-wide border-b border-white/5">
                  Recent
                </div>
                {recentLocations.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(loc)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/5 transition-colors"
                    role="option"
                  >
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-slate-300 truncate">{loc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
