// GC_FIX: Dynamic categories for mobile nav
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface Category {
  id: number;
  name: string;
  slug: string;
  gameCount?: number;
}

interface MobileNavCategoriesProps {
  onLinkClick?: () => void;
}

function MobileNavCategories({ onLinkClick }: MobileNavCategoriesProps) {
  const { data = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const r = await fetch("/api/categories");
      if (!r.ok) throw new Error("categories");
      return r.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="mt-4">
      <div className="px-3 text-gray-400 uppercase text-xs font-semibold mb-2">Categories</div>
      <nav className="space-y-1">
        {data.map((c) => (
          <Link 
            key={c.id} 
            href={`/category/${c.slug}`} 
            className="block py-2 px-3 text-white hover:text-amber-500 transition-colors rounded-md hover:bg-gray-800"
            onClick={onLinkClick}
          >
            <div className="flex items-center justify-between">
              <span>{c.name}</span>
              {typeof c.gameCount === "number" && (
                <span className="text-xs text-gray-400">{c.gameCount}</span>
              )}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default MobileNavCategories;