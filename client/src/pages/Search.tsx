// SEARCH_REFACTOR: Dedicated search page for unified search flow
import { useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/search/SearchBar";
import GameCard from "@/components/games/GameCard";
import { Game } from "@/types";
import { apiRequest } from "@/lib/queryClient";

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function SearchPage() {
  const search = useSearch(); // "?q=foo&sort=.."
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const [localQ, setLocalQ] = useState<string>(params.get("q") || "");
  const debouncedQ = useDebounced(localQ, 250);

  // Keep URL in sync when typing on /search
  useEffect(() => {
    const p = new URLSearchParams(search);
    if (debouncedQ) p.set("q", debouncedQ);
    else p.delete("q");
    const url = `/search?${p.toString()}`;
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", url);
    }
  }, [debouncedQ, search]);

  // Update local search when URL params change (e.g., browser back/forward)
  useEffect(() => {
    const urlQ = params.get("q") || "";
    if (urlQ !== localQ) {
      setLocalQ(urlQ);
    }
  }, [params]);

  const sort = params.get("sort") || "";
  const date = params.get("date") || "";
  const rating = params.get("rating") || "";

  const { data, isLoading } = useQuery<{ items: Game[]; total: number }>({
    queryKey: ["/api/games", { q: debouncedQ, sort, date, rating }],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (debouncedQ) p.set("q", debouncedQ); // Use 'q' param as supported by server
      if (sort) p.set("sort", sort);
      if (date) p.set("date", date); // Use 'date' param as supported by server
      if (rating) p.set("rating", rating);
      p.set("limit", "36");
      const response = await apiRequest("GET", `/api/games?${p.toString()}`);
      return response;
    },
    keepPreviousData: true,
  });

  return (
    <section className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-title font-bold mb-3 text-white">Search</h1>
      <div className="relative max-w-xl">
        <input
          type="search"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="Search games..."
          className="w-full h-11 rounded-md bg-[#111827] text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 px-3 pr-10"
          aria-label="Search games"
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-amber-400"
          aria-label="Search"
        >
          <span className="material-icons">search</span>
        </button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {isLoading ? "Searching…" : `${data?.total ?? 0} results`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {data?.items?.length
          ? data.items.map((g) => <GameCard key={g.id} game={g} />)
          : !isLoading && (
              <div className="col-span-full text-gray-400 text-center py-8">
                No games found. Try another keyword.
              </div>
            )}
      </div>
    </section>
  );
}