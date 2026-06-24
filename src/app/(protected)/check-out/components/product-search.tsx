"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, AlertCircle, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import productsData from "../../products/data/products.json";

interface Product {
  id: string;
  productCode: string;
  sku: string;
  barcode: string;
  name: string;
  categoryName: string;
  brandName: string;
  retailPrice: number;
  costPrice: number;
  VAT: number;
  stock: number;
  status: string;
  imageUrl?: string;
}

interface ProductSearchProps {
  onProductSelect: (product: Product) => void;
}

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );

export function ProductSearch({ onProductSelect }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quick select items (first 5 active items)
  const quickItems = (productsData as Product[])
    .filter((p) => p.status === "ACTIVE" && p.stock > 0)
    .slice(0, 5);

  // Focus search input on F2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter products based on search input
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = (productsData as Product[]).filter((product) => {
      return (
        product.name.toLowerCase().includes(lowerQuery) ||
        product.productCode.toLowerCase().includes(lowerQuery) ||
        product.sku.toLowerCase().includes(lowerQuery) ||
        product.barcode.includes(lowerQuery)
      );
    });

    // Barcode auto-add feature: if there's an exact barcode match, select it immediately
    const exactMatch = filtered.find(
      (p) =>
        p.barcode === query || p.productCode.toLowerCase() === lowerQuery,
    );
    if (exactMatch && exactMatch.status === "ACTIVE") {
      onProductSelect(exactMatch);
      setQuery("");
      setResults([]);
      setIsOpen(false);
      return;
    }

    setResults(filtered);
    setIsOpen(true);
    setSelectedIndex(-1);
  }, [query, onProductSelect]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (product: Product) => {
    if (product.status !== "ACTIVE") {
      return; // Do not add inactive products
    }
    onProductSelect(product);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3 w-full">
      {/* Search Input Box */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Tìm sản phẩm [F2] (Nhập mã, tên hoặc quét mã vạch)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 h-12 w-full text-lg font-bold border-primary/20 focus-visible:ring-primary shadow-xs"
        />

        {/* Floating Autocomplete Dropdown */}
        {isOpen && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground border rounded-lg shadow-lg max-h-[320px] overflow-y-auto w-full divide-y scrollbar-thin"
          >
            {results.map((product, index) => {
              const isSelected = index === selectedIndex;
              const isOutOfStock = product.stock <= 0;
              const isInactive = product.status !== "ACTIVE";

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className={cn(
                    "flex items-center gap-3 p-2.5 cursor-pointer text-base transition-colors duration-150",
                    isSelected && "bg-primary/10 dark:bg-primary/20",
                    (isOutOfStock || isInactive) && "opacity-60 cursor-not-allowed",
                    product.status === "ACTIVE" && !isOutOfStock && "hover:bg-muted/60",
                  )}
                >
                  {/* Thumbnail */}
                  <div className="size-10 rounded border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="object-cover size-full"
                      />
                    ) : (
                      <ShoppingBag className="size-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground text-base truncate">{product.name}</div>
                    <div className="flex gap-2 text-sm text-muted-foreground font-mono mt-0.5">
                      <span>{product.sku}</span>
                      <span>•</span>
                      <span>Mã vạch: {product.barcode}</span>
                    </div>
                  </div>

                  {/* Price and Stock status */}
                  <div className="text-right shrink-0 space-y-1">
                    <div className="font-bold text-foreground text-lg">
                      {formatVND(product.retailPrice)}
                    </div>
                    <div>
                      {isInactive ? (
                        <span className="text-sm px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">Ngừng bán</span>
                      ) : isOutOfStock ? (
                        <span className="text-sm px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">Hết hàng</span>
                      ) : (
                        <span className="text-sm px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded font-medium">Tồn: {product.stock}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* If searching but no results found */}
        {isOpen && results.length === 0 && query.trim() !== "" && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground border rounded-lg shadow-lg p-4 text-center text-base text-muted-foreground flex flex-col items-center justify-center gap-1.5"
          >
            <AlertCircle className="size-5 text-yellow-500" />
            <span>Không tìm thấy sản phẩm nào khớp với từ khóa "{query}"</span>
          </div>
        )}
      </div>

      {/* Quick Click Items Grid */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground flex items-center gap-1">
          <Sparkles className="size-3 text-primary" /> Mua nhanh:
        </span>
        {quickItems.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => handleSelect(product)}
            className="text-sm font-semibold px-2.5 py-1 border rounded-full bg-background hover:bg-primary/5 hover:border-primary/40 text-foreground transition-all cursor-pointer shadow-xs max-w-[150px] truncate"
          >
            {product.name}
          </button>
        ))}
      </div>
    </div>
  );
}
