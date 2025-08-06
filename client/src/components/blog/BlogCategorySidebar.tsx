import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Folder, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogCategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

const BlogCategorySidebar: React.FC<BlogCategorySidebarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery<Category[]>({
    queryKey: ['/api/blog/categories'],
    queryFn: async () => {
      const res = await fetch('/api/blog/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const {
    data: popularPostsData,
    isLoading: isLoadingPopular,
  } = useQuery<{posts: any[], total: number, totalPages: number}>({
    queryKey: ['/api/blog/posts', 'popular'],
    queryFn: async () => {
      const res = await fetch('/api/blog/posts?status=published&limit=5&order=popular');
      if (!res.ok) throw new Error('Failed to fetch popular posts');
      return res.json();
    },
  });
  
  // Extract the posts array from the response or use an empty array if not available
  const popularPosts = popularPostsData?.posts || [];

  const handleCategoryClick = (slug: string | null) => {
    onSelectCategory(slug);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-muted-foreground text-sm">Failed to load categories</p>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground text-sm">No categories found</p>
          ) : (
            <div className="space-y-1">
              <Button
                variant={selectedCategory === null ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start font-normal"
                onClick={() => handleCategoryClick(null)}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-between font-normal"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  <span className="truncate">{category.name}</span>
                  <span className="ml-auto text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {category.postCount}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Popular Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingPopular ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : popularPosts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No popular posts found</p>
          ) : (
            <div className="space-y-4">
              {popularPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <a
                    href={`/blog/${post.slug}`}
                    className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                  >
                    {post.title}
                  </a>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    {post.viewCount !== null && (
                      <span className="ml-2">{post.viewCount} views</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default BlogCategorySidebar;