import { useParams } from "wouter";
import { useEffect } from "react";

export default function PlayFrame() {
  const params = useParams();
  const slug = params.slug || "";

  useEffect(() => {
    // Redirect to the actual game
    if (slug) {
      window.location.href = `/play/${slug}/`;
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading game...</p>
      </div>
    </div>
  );
}