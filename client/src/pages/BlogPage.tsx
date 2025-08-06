import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { BlogPost } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import Container from '@/components/ui/container';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogCategorySidebar from '@/components/blog/BlogCategorySidebar';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const POSTS_PER_PAGE = 9;

const BlogPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchBlogPosts = async () => {
    let url = `/api/blog/posts?page=${currentPage}&limit=${POSTS_PER_PAGE}`;
    
    if (selectedCategory) {
      url += `&category=${selectedCategory}`;
    }
    
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    return response.json();
  };

  const {
    data,
    isLoading,
    error,
  } = useQuery<{
    posts: BlogPost[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['/api/blog/posts', currentPage, selectedCategory, searchQuery],
    queryFn: fetchBlogPosts,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(tempSearchQuery);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const posts = data?.posts || [];
  const totalPages = data?.totalPages || 1;

  return (
    <PageLayout>
      <Helmet>
        <title>Blog - GamesChakra</title>
        <meta
          name="description"
          content="Stay updated with the latest news, guides, and insights about HTML5 games and the gaming industry on the GamesChakra blog."
        />
      </Helmet>

      <section className="py-12 bg-gradient-to-b from-primary/10 to-background">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl font-bold mb-4">GamesChakra Blog</h1>
            <p className="text-muted-foreground text-lg">
              Stay updated with the latest news, guides, and insights about HTML5 games and the gaming industry.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search blog posts..."
                  className="pl-9"
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="space-y-3">
                      <Skeleton className="h-[200px] w-full rounded-xl" />
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">Error loading blog posts</h3>
                  <p className="text-muted-foreground">Please try again later.</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? `No results found for "${searchQuery}"`
                      : selectedCategory
                      ? "No posts in this category yet"
                      : "No blog posts available yet."}
                  </p>
                  {(searchQuery || selectedCategory) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setTempSearchQuery('');
                        setSelectedCategory(null);
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {posts.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>

            <div className="space-y-6">
              <BlogCategorySidebar
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryChange}
              />
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
};

export default BlogPage;