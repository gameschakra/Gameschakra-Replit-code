import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { BlogPost } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BlogPostCardProps {
  post: BlogPost;
  variant?: 'default' | 'full';
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, variant = 'default' }) => {
  const isFull = variant === 'full';
  
  // Format date
  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Truncate content
  const truncatedContent = post.content
    ? post.content.replace(/<[^>]*>/g, '').slice(0, isFull ? 300 : 150) + (post.content.length > (isFull ? 300 : 150) ? '...' : '')
    : '';
  
  return (
    <Card className={cn("overflow-hidden h-full flex flex-col", 
      isFull ? "md:flex-row" : ""
    )}>
      {post.featuredImage && (
        <div className={cn(
          "relative overflow-hidden",
          isFull ? "md:w-1/2 h-[300px] md:h-auto" : "h-[200px]"
        )}>
          <img 
            src={post.featuredImage} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
      )}
      
      <div className={cn("flex flex-col", isFull ? "md:w-1/2" : "")}>
        <CardHeader>
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {post.categories.map((category) => (
                <Badge key={category.id} variant="outline">
                  <a href={`/blog?category=${category.slug}`}>{category.name}</a>
                </Badge>
              ))}
            </div>
          )}
          
          <CardTitle className={cn("mb-2", isFull ? "text-2xl md:text-3xl" : "text-xl")}>
            <a 
              href={`/blog/${post.slug}`} 
              className="hover:text-primary transition-colors"
            >
              {post.title}
            </a>
          </CardTitle>
          
          <CardDescription className="flex flex-wrap gap-3 text-sm">
            {post.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{post.author.username}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time dateTime={new Date(post.publishedAt || post.createdAt).toISOString()}>
                {formattedDate}
              </time>
            </div>
            
            {post.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{post.readingTime}</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground">
            {post.metaDescription || truncatedContent}
          </p>
        </CardContent>
        
        <CardFooter className="mt-auto pt-4">
          <a 
            href={`/blog/${post.slug}`} 
            className="text-primary hover:underline font-medium"
          >
            Read more
          </a>
        </CardFooter>
      </div>
    </Card>
  );
};

export default BlogPostCard;