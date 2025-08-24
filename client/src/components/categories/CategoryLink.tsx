import React from "react";
import { Link, useLocation } from "wouter";
import { Category } from "@/types";

interface CategoryLinkProps {
  category: Category & { gameCount?: number };
  variant?: "sidebar" | "pill";
  className?: string;
}

export default function CategoryLink({ category, variant = "sidebar", className = "" }: CategoryLinkProps) {
  const [location] = useLocation();
  const isActive = location === `/category/${category.slug}` || location.startsWith(`/category/${category.slug}`);

  if (variant === "pill") {
    return (
      <Link
        href={`/category/${category.slug}`}
        className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${
          isActive
            ? "bg-amber-500 hover:bg-amber-600 text-black border-0 shadow-lg shadow-amber-500/25"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 hover:border-gray-600"
        } ${className}`}
      >
        {category.name}
        {category.gameCount && category.gameCount > 0 && (
          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
            isActive 
              ? "bg-black/20 text-black"
              : "bg-gray-700 text-gray-300"
          }`}>
            {category.gameCount}
          </span>
        )}
      </Link>
    );
  }

  // Default sidebar variant
  return (
    <Link
      href={`/category/${category.slug}`}
      className={`flex items-center justify-between px-2 py-2 text-sm rounded-lg transition-colors ${
        isActive
          ? 'bg-amber-500/20 text-amber-400 font-medium'
          : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'
      } ${className}`}
    >
      <span>{category.name}</span>
      {category.gameCount && category.gameCount > 0 && (
        <span className="bg-gray-800 text-xs text-gray-300 px-2 py-0.5 rounded">
          {category.gameCount}
        </span>
      )}
    </Link>
  );
}