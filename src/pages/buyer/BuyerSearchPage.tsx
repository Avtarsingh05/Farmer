import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, X, ArrowUpDown, ShoppingCart, 
  RefreshCw, Sparkles, Filter, Check, ArrowRight, PackageOpen
} from 'lucide-react';
import { ProductListItem, Category } from '@/types';
import { getPublicProducts } from '@/services/productService';
import { getActiveCategories } from '@/services/categoryService';
import { ProductCard } from '@/components/shared/ProductCard';
import { useDebounce, useCart } from '@/hooks';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';

const POPULAR_SEARCH_TAGS = [
  'Tomatoes',
  'Nashik Onions',
  'Basmati Rice',
  'Alphonso Mango',
  'Potatoes',
  'Chana Dal',
  'Turmeric',
  'Wheat',
];

export default function BuyerSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { itemCount, total } = useCart();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const initialQuery = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedGrade, setSelectedGrade] = useState<string>(searchParams.get('grade') || 'all');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.get('in_stock') === 'true');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 250);

  // Load categories and initial products
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [cats, prodsRes] = await Promise.all([
          getActiveCategories().catch(() => []),
          getPublicProducts({}, 50),
        ]);
        if (isMounted) {
          setCategories(cats);
          setProducts(prodsRes.products || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load produce catalogue');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  // Sync state changes with URL query parameters for bookmarking & sharing
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedGrade !== 'all') params.set('grade', selectedGrade);
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (inStockOnly) params.set('in_stock', 'true');
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, selectedGrade, sortBy, inStockOnly, setSearchParams]);

  // Client-side filtering & search matching across all fields
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Search term query match
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = (item.categoryName || '').toLowerCase().includes(q);
        const matchesFarmer = (item.farmerName || '').toLowerCase().includes(q);
        const matchesDistrict = (item.district || '').toLowerCase().includes(q);
        const matchesState = (item.state || '').toLowerCase().includes(q);

        if (!matchesName && !matchesCategory && !matchesFarmer && !matchesDistrict && !matchesState) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (item.categoryId !== selectedCategory && item.categoryName?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Quality grade filter
      if (selectedGrade !== 'all') {
        if (item.qualityGrade !== selectedGrade) {
          return false;
        }
      }

      // In-stock only filter
      if (inStockOnly) {
        if (item.quantity <= 0 || item.availabilityStatus === 'sold_out' || item.availabilityStatus === 'inactive') {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'qty_desc') return b.quantity - a.quantity;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0; // 'featured' keeps curated order
    });
  }, [products, debouncedSearch, selectedCategory, selectedGrade, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedCategory('all');
    setSelectedGrade('all');
    setSortBy('featured');
    setInStockOnly(false);
  };

  const hasActiveFilters = Boolean(
    searchInput.trim() ||
    selectedCategory !== 'all' ||
    selectedGrade !== 'all' ||
    sortBy !== 'featured' ||
    inStockOnly
  );

  return (
    <div className="container-content py-6 space-y-6 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 flex items-center gap-2">
            <span>Search Farm Produce</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Direct Farm Gate
            </span>
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Browse authentic agricultural listings with APMC mandi market price benchmarks.
          </p>
        </div>

        {/* Quick Cart summary on desktop */}
        {itemCount > 0 && (
          <Link
            to="/buyer/cart"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm font-medium text-sm transition-all shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart ({itemCount} items · {formatCurrency(total)})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Main Search Input & Bar */}
      <div className="card p-4 shadow-sm border border-neutral-200 bg-white">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by vegetable, fruit, grain, mandi, or farmer name..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-neutral-50/60 transition-all"
              autoFocus
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2.5 pl-3 pr-8 text-xs sm:text-sm font-medium border border-neutral-300 rounded-lg bg-white text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="featured">✨ Recommended</option>
                <option value="price_asc">₹ Price: Low to High</option>
                <option value="price_desc">₹ Price: High to Low</option>
                <option value="qty_desc">📦 Available Stock</option>
                <option value="name_asc">🔤 Name (A - Z)</option>
              </select>
            </div>

            {/* Filter Toggle Mobile */}
            <button
              type="button"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className={cn(
                "md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors",
                hasActiveFilters
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-neutral-300 bg-white text-neutral-700"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Popular Search Suggestions */}
        <div className="mt-3.5 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Trending:
          </span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchInput(tag)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-full border transition-colors",
                searchInput.toLowerCase() === tag.toLowerCase()
                  ? "bg-primary text-white border-primary"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200"
              )}
            >
              {tag}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs font-medium text-red-600 hover:text-red-800 underline underline-offset-2 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Category & Grade Pills */}
      <div className={cn("space-y-3", showFiltersMobile ? "block" : "hidden md:block")}>
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-neutral-500 shrink-0">Category:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0",
              selectedCategory === 'all'
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
            )}
          >
            All Produce
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5",
                selectedCategory === cat.id || selectedCategory === cat.name.toLowerCase()
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Quality Grade & Stock Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-neutral-500 shrink-0">Quality Grade:</span>
            {['all', 'A', 'B', 'C'].map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium border transition-all",
                  selectedGrade === grade
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                )}
              >
                {grade === 'all' ? 'All Grades' : `Grade ${grade}`}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4 border-neutral-300"
            />
            <span>Only show available stock</span>
          </label>
        </div>
      </div>

      {/* Results Header Bar */}
      <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-200 pb-2">
        <span className="font-medium">
          Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'produce item' : 'produce items'}
          {debouncedSearch && ` for "${debouncedSearch}"`}
        </span>
        {hasActiveFilters && (
          <span className="text-neutral-400">
            Filtered from {products.length} total products
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="card p-6 bg-red-50 border border-red-200 text-center space-y-3">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary text-xs py-1.5 px-3"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="card overflow-hidden animate-pulse flex flex-col h-72">
              <div className="aspect-[3/2] bg-neutral-200 w-full" />
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-neutral-200 rounded w-1/3" />
                  <div className="h-8 bg-neutral-200 rounded w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Produce Grid */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="card p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-4 border border-dashed border-neutral-300">
          <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
            <PackageOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">No produce found</h3>
            <p className="text-sm text-neutral-500 mt-1">
              We couldn't find any products matching your search criteria. Try adjusting your search query or removing filters.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-primary text-xs py-2 px-4 shadow-sm"
            >
              Clear All Filters & View All
            </button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Cart Bar on Mobile when items exist */}
      {itemCount > 0 && (
        <div className="sm:hidden fixed bottom-16 left-0 right-0 p-3 bg-emerald-900/95 backdrop-blur-md text-white border-t border-emerald-800 shadow-xl z-40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs">
              {itemCount}
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight">{itemCount} items selected</p>
              <p className="text-[11px] text-emerald-200">{formatCurrency(total)} subtotal</p>
            </div>
          </div>
          <Link
            to="/buyer/cart"
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow"
          >
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
