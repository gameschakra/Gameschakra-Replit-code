import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaceholderImage } from "@/components/ui/placeholder-image";

export default function GameCategories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <section className="py-10 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-title font-bold mb-6">Game Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-28 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-title font-bold mb-6">Game Categories</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(category => (
            <Link 
              key={category.id} 
              href={`/?category=${category.slug}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <div className="relative pb-[75%]">
                {category.imageUrl ? (
                  <img 
                    src={category.imageUrl} 
                    alt={`${category.name} Games`} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full">
                    <PlaceholderImage 
                      text={category.name}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3">
                  <h3 className="text-white font-title font-bold">{category.name}</h3>
                  <p className="text-xs text-gray-200">{category.gameCount} games</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
