import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface RichTextEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  initialContent = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  
  const [imageUrl, setImageUrl] = useState('');
  const [imageOpen, setImageOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'text-primary hover:underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full h-auto my-4 mx-auto',
          loading: 'lazy', // Add lazy loading for SEO
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none',
        spellcheck: 'true',
      },
    },
  });

  // Set initial content when the component mounts or when initialContent changes
  useEffect(() => {
    if (editor && editor.isEmpty && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  // Handle link submission
  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    
    // Check if the URL has http:// or https:// prefix
    const url = linkUrl.trim();
    const hasProtocol = /^https?:\/\//.test(url);
    const finalUrl = hasProtocol ? url : `https://${url}`;

    editor?.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
    
    setLinkUrl('');
    setLinkOpen(false);
  };

  // Handle image submission
  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    
    editor?.chain().focus().setImage({ src: imageUrl }).run();
    
    setImageUrl('');
    setImageOpen(false);
  };

  // Check if the selection has a specific mark or node
  const isActive = (type: string, options?: any) => {
    if (!editor) return false;
    
    if (type === 'heading') {
      return editor.isActive('heading', options);
    }
    
    return editor.isActive(type, options);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={`border rounded-md p-2 ${className}`}>
      <div className="flex flex-wrap gap-1 mb-2 border-b pb-2">
        {/* Text Formatting */}
        <Button
          variant={isActive('bold') ? 'default' : 'outline'}
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="w-8 h-8"
          type="button"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          variant={isActive('italic') ? 'default' : 'outline'}
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="w-8 h-8"
          type="button"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-8 bg-border mx-1" />
        
        {/* Headings */}
        <Button
          variant={isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="w-8 h-8"
          type="button"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        
        <Button
          variant={isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="w-8 h-8"
          type="button"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        
        <Button
          variant={isActive('heading', { level: 3 }) ? 'default' : 'outline'}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="w-8 h-8"
          type="button"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-8 bg-border mx-1" />
        
        {/* Lists */}
        <Button
          variant={isActive('bulletList') ? 'default' : 'outline'}
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="w-8 h-8"
          type="button"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        
        <Button
          variant={isActive('orderedList') ? 'default' : 'outline'}
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="w-8 h-8"
          type="button"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        
        {/* Special Elements */}
        <Button
          variant={isActive('blockquote') ? 'default' : 'outline'}
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="w-8 h-8"
          type="button"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        
        <Button
          variant={isActive('codeBlock') ? 'default' : 'outline'}
          size="icon"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className="w-8 h-8"
          type="button"
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-8 bg-border mx-1" />
        
        {/* Link and Image */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={isActive('link') ? 'default' : 'outline'}
              size="icon"
              className="w-8 h-8"
              type="button"
              title="Add Link"
              onClick={() => {
                if (isActive('link')) {
                  editor.chain().focus().unsetLink().run();
                  return;
                }
                setLinkOpen(true);
              }}
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <form onSubmit={handleLinkSubmit}>
              <div className="space-y-2">
                <h4 className="font-medium">Add Link</h4>
                <Input
                  type="text"
                  placeholder="Enter URL (e.g. https://example.com)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="col-span-3"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLinkOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Link</Button>
                </div>
              </div>
            </form>
          </PopoverContent>
        </Popover>
        
        <Popover open={imageOpen} onOpenChange={setImageOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              type="button"
              title="Add Image"
              onClick={() => setImageOpen(true)}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <form onSubmit={handleImageSubmit}>
              <div className="space-y-2">
                <h4 className="font-medium">Add Image</h4>
                <Input
                  type="text"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="col-span-3"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setImageOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Image</Button>
                </div>
              </div>
            </form>
          </PopoverContent>
        </Popover>
        
        <div className="w-px h-8 bg-border mx-1" />
        
        {/* Undo/Redo */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="w-8 h-8"
          type="button"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="w-8 h-8"
          type="button"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-8 bg-border mx-1" />
        
        {/* Clear content */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().clearContent().run()}
          className="w-8 h-8 ml-auto"
          type="button"
          title="Clear Content"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <EditorContent 
        editor={editor} 
        className="min-h-[200px] max-h-[500px] overflow-y-auto prose-img:mx-auto"
      />
      
      {!editor.isEmpty && (
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t mt-2">
          <div>
            {editor.storage.characterCount.words()} words, {editor.storage.characterCount.characters()} characters
          </div>
          <div>
            {Math.ceil(editor.storage.characterCount.words() / 200)} min read
          </div>
        </div>
      )}
    </div>
  );
}

// Markdown preview component
export function MarkdownPreview({ content }: { content: string }) {
  // Use React-Markdown to render the content
  return (
    <div className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}