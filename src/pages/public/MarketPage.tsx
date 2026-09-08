import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, Package } from 'lucide-react';
import { getPublicProducts } from '@/services/productService';
import { getActiveCategories } from '@/services/categoryService';
import type { ProductListItem, Category } from '@/types';
import { useDebounce } from '@/hooks';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ProductCard } from '@/components/shared/ProductCard';

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

  const debouncedSearch = useDebounce(searchInput, 350);
  const filtered = debouncedSearch
    ? products.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.farmerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.district ?? '').toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : products;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Hero Banner */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[21/9] md:aspect-[21/6] flex items-center animate-fade-up">
            <img 
              src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=2000&auto=format&fit=crop&q=80" 
              alt="Fresh produce market" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 via-neutral-900/60 to-transparent" />
            <div className="relative z-10 p-8 md:p-12 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Fresh Produce Market
              </h1>
              <p className="text-lg text-neutral-200">
                Sourced directly from verified farmers across India. Quality assured, transparent pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + filter bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 mb-8 flex flex-col sm:flex-row gap-3 animate-fade-up animate-delay-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search produce, farmer, location..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-900"
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
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="btn-secondary flex items-center gap-2 sm:w-auto py-3 px-6 h-auto"
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
          <div className="card p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-up">
            <div>
              <label className="form-label text-sm font-medium text-neutral-700 mb-1.5 block">Category</label>
              <select
                className="form-input w-full"
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
              <label className="form-label text-sm font-medium text-neutral-700 mb-1.5 block">Quality Grade</label>
              <select
                className="form-input w-full"
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
                  className="btn-ghost text-sm w-full sm:w-auto text-neutral-600 hover:text-neutral-900"
                >
                  <X className="w-4 h-4 mr-2 inline" /> Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
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
          <div className="animate-fade-up animate-delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Available Listings</h2>
              <p className="text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
