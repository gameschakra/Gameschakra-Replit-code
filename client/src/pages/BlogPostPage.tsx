import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Helmet } from 'react-helmet';
import { BlogPost } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import Container from '@/components/ui/container';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, Eye, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InArticleAd from '@/components/ads/InArticleAd';

const BlogPostPage: React.FC = () => {
  const [, params] = useRoute<{ slug: string }>('/blog/:slug');
  const slug = params?.slug;

  const {
    data: post,
    isLoading,
    error,
  } = useQuery<BlogPost>({
    queryKey: ['/api/blog/posts', slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: !!slug,
  });

  const {
    data: relatedPosts = [],
    isLoading: isLoadingRelated,
  } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts/related', slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/posts/related/${slug}?limit=3`);
      if (!response.ok) {
        throw new Error('Failed to fetch related posts');
      }
      return response.json();
    },
    enabled: !!slug && !!post,
  });

  // Record view count
  useEffect(() => {
    if (slug && post) {
      fetch(`/api/blog/posts/${slug}/view`, { method: 'POST' }).catch(console.error);
    }
  }, [slug, post]);
  
  // Generate schema markup for SEO
  const generateSchemaMarkup = () => {
    if (!post) return null;
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://gameschakra.com/blog/${post.slug}`,
      },
      headline: post.title,
      description: post.metaDescription || '',
      image: post.featuredImage || '',
      author: {
        '@type': 'Person',
        name: post.author?.username || 'GamesChakra',
      },
      publisher: {
        '@type': 'Organization',
        name: 'GamesChakra',
        logo: {
          '@type': 'ImageObject',
          url: 'https://gameschakra.com/logo.png',
        },
      },
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt,
    };
    
    return JSON.stringify(schema);
  };

  return (
    <PageLayout>
      {post && (
        <Helmet>
          <title>{post.title} - GamesChakra Blog</title>
          <meta name="description" content={post.metaDescription || `${post.title} - Read on GamesChakra Blog`} />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.metaDescription || `${post.title} - Read on GamesChakra Blog`} />
          {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
          <meta property="og:type" content="article" />
          <meta property="article:published_time" content={new Date(post.publishedAt || post.createdAt).toISOString()} />
          <meta property="article:modified_time" content={new Date(post.updatedAt).toISOString()} />
          <script type="application/ld+json">{generateSchemaMarkup()}</script>
        </Helmet>
      )}

      <Container>
        <div className="py-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-14 w-3/4 my-4" />
              <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-[300px] w-full mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
              <p className="text-muted-foreground mb-6">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <a href="/blog">Back to Blog</a>
              </Button>
            </div>
          ) : post ? (
            <article className="max-w-4xl mx-auto">
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  {post.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author.username}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={new Date(post.publishedAt || post.createdAt).toISOString()}>
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  
                  {post.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readingTime}</span>
                    </div>
                  )}
                  
                  {post.viewCount !== null && post.viewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.viewCount} views</span>
                    </div>
                  )}
                </div>
                
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories.map((category) => (
                      <Badge key={category.id} variant="outline">
                        <a href={`/blog?category=${category.slug}`}>{category.name}</a>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {post.featuredImage && (
                  <div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </header>
              
              {/* Insert ad after first paragraph */}
              {post.content && (
                <>
                  <div 
                    className="prose dark:prose-invert prose-headings:scroll-mt-20 prose-img:rounded-lg max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: post.content.split('</p>')[0] + '</p>' 
                    }}
                  />
                  
                  {/* In-article ad placement */}
                  <InArticleAd
                    adClient="ca-pub-XXXXXXXXXXXXXXXX"
                    adSlot="XXXXXXXXXX"
                    className="my-8"
                  />
                  
                  <div 
                    className="prose dark:prose-invert prose-headings:scroll-mt-20 prose-img:rounded-lg max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: post.content.split('</p>').slice(1).join('</p>')
                    }}
                  />
                </>
              )}
              
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center flex-wrap gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ) : null}
        </div>
      </Container>

      {/* Bottom Ad placement */}
      <Container>
        <div className="my-8">
          <InArticleAd
            adClient="ca-pub-XXXXXXXXXXXXXXXX"
            adSlot="XXXXXXXXXX"
            className="py-4"
          />
        </div>
      </Container>
      
      {post && relatedPosts.length > 0 && (
        <div className="py-12 bg-muted/30">
          <Container>
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoadingRelated ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))
              ) : (
                relatedPosts.map((relatedPost) => (
                  <BlogPostCard key={relatedPost.id} post={relatedPost} />
                ))
              )}
            </div>
          </Container>
        </div>
      )}
    </PageLayout>
  );
};

export default BlogPostPage;