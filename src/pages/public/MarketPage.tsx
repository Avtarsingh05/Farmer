import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { getPublicProducts } from '@/services/productService';
import { getActiveCategories } from '@/services/categoryService';
import type { ProductListItem, Category, AvailabilityStatus } from '@/types';
import { formatPricePerUnit } from '@/utils/currency';
import { useDebounce } from '@/hooks';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { getProductThumbnail } from '@/services/cloudinaryService';
import { Package } from 'lucide-react';

const QUALITY_LABELS: Record<string, string> = {
  A: 'Grade A', B: 'Grade B', C: 'Grade C', mixed: 'Mixed',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Available', limited: 'Limited',
};

function ProductCardItem({ product }: { product: ProductListItem }) {
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
  const imageUrl = product.images?.[0]?.secureUrl
    || (product.images?.[0]?.publicId ? getProductThumbnail(product.images[0].publicId, 400) : null)
    || DEFAULT_IMAGE;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block card hover:shadow-md transition-shadow duration-150"
    >
      <div className="aspect-[4/3] bg-neutral-100 rounded-t-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
          }}
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-neutral-900 text-sm leading-tight line-clamp-1">
            {product.name}
          </h3>
          <span className={`badge-${product.availabilityStatus === 'available' ? 'green' : 'amber'} shrink-0 text-xs`}>
            {STATUS_LABELS[product.availabilityStatus] ?? product.availabilityStatus}
          </span>
        </div>
        <p className="text-xs text-neutral-500 truncate">
          {product.farmerName}
          {product.district ? ` · ${product.district}` : ''}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-primary text-sm">
            {formatPricePerUnit(product.price, product.unit)}
          </span>
          <span className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
            {QUALITY_LABELS[product.qualityGrade] ?? product.qualityGrade}
          </span>
        </div>
        <p className="text-xs text-neutral-500">
          {product.quantity} {product.unit} available
        </p>
      </div>
    </Link>
  );
}

export default function MarketPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState<ProductListItem[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showFilters, setShowFilters]   = useState(false);
  const [searchInput, setSearchInput]   = useState('');

  const categoryId = searchParams.get('category') ?? '';
  const qualityGrade = searchParams.get('quality') ?? '';
  const sortBy = searchParams.get('sort') ?? 'newest';

  useEffect(() => {
    getActiveCategories().then(setCategories).catch(() => {/* non-critical */});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPublicProducts({
        categoryId: categoryId || undefined,
        qualityGrade: (qualityGrade as any) || undefined,
      }, 24);
      setProducts(result.products);
    } catch {
      setError('We couldn\'t load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [categoryId, qualityGrade]);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  }

  // Client-side search filter (Firestore doesn't support full-text)
  const debouncedSearch = useDebounce(searchInput, 350);
  const filtered = debouncedSearch
    ? products.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.farmerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.district ?? '').toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : products;

  return (
    <div className="container-content py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="page-title">Fresh Produce</h1>
        <p className="text-neutral-600 mt-1 text-sm">
          Sourced directly from verified farmers across India.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search produce, farmer, location..."
            className="form-input pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search products"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="btn-secondary btn flex items-center gap-2 sm:w-auto"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(categoryId || qualityGrade) && (
            <span className="w-2 h-2 rounded-full bg-primary ml-1" />
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={categoryId}
              onChange={(e) => setFilter('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Quality Grade</label>
            <select
              className="form-input"
              value={qualityGrade}
              onChange={(e) => setFilter('quality', e.target.value)}
            >
              <option value="">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div className="flex items-end">
            {(categoryId || qualityGrade) && (
              <button
                onClick={() => {
                  setFilter('category', '');
                  setFilter('quality', '');
                }}
                className="btn-ghost btn text-sm"
              >
                <X className="w-4 h-4" /> Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={loadProducts} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No produce found"
          description={
            debouncedSearch
              ? `No results for "${debouncedSearch}". Try a different search.`
              : 'No products match your filters. Try clearing them.'
          }
          action={
            (categoryId || qualityGrade || debouncedSearch)
              ? { label: 'Clear filters', onClick: () => { setFilter('category', ''); setFilter('quality', ''); setSearchInput(''); } }
              : undefined
          }
        />
      ) : (
        <>
          <p className="text-sm text-neutral-600 mb-4">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCardItem key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
