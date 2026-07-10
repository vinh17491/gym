import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Loader2, Dumbbell, Sparkles, Zap } from 'lucide-react';
import api from '../../api/axios';
import ProductCard from '../../components/products/ProductCard';
import ProductFilters from '../../components/products/ProductFilters';
import ProductSearchBar from '../../components/products/ProductSearchBar';

interface Product {
  id: number; name: string; price: number; sale_price?: number; original_price?: number;
  main_image: string; rating: number; review_count: number; slug: string; stock: number;
  brand_name: string; category_name: string; category_slug: string; is_featured: boolean;
  is_new?: boolean; is_on_sale?: boolean; weight?: number; flavor?: string; color?: string; size?: string; tags?: string;
}

interface Filters {
  category: string; minPrice: number; maxPrice: number; brand: string;
  inStock: boolean; featured: boolean; sort: string;
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-[#0F172A] border border-[#1e293b] rounded-2xl overflow-hidden animate-pulse">
        <div className="aspect-[4/5] bg-dark-800/50" />
        <div className="p-4 space-y-3">
          <div className="h-3 w-16 bg-dark-800/70 rounded-full" />
          <div className="h-4 w-3/4 bg-dark-800/70 rounded-lg" />
          <div className="h-3 w-1/2 bg-dark-800/70 rounded-lg" />
          <div className="flex justify-between">
            <div className="h-5 w-20 bg-dark-800/70 rounded-lg" />
            <div className="h-3 w-16 bg-dark-800/70 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 20, pages: 0 });
  const [filters, setFilters] = useState<Filters>({
    category: '', minPrice: 0, maxPrice: 10000, brand: '',
    inStock: false, featured: false, sort: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchProducts(); }, [filters, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 10000) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.brand && filters.brand !== 'all') params.append('brand', filters.brand);
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.featured) params.append('featured', 'true');
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', filters.sort);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data || []);
      setPagination(response.data.pagination || pagination);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: 0, maxPrice: 10000, brand: '', inStock: false, featured: false, sort: 'newest' });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;
    const pages: (number | string)[] = [];
    const total = pagination.pages;
    const current = pagination.page;
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(current - 1)}
          disabled={current <= 1}
          className="p-2.5 rounded-xl bg-[#0F172A] border border-[#1e293b] text-dark-300 hover:border-orange-500/30 hover:text-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronLeft size={18} />
        </button>
        {pages.map((page, i) =>
          typeof page === 'string' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-dark-500">...</span>
          ) : (
            <motion.button
              key={page}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(page)}
              className={`min-w-[44px] h-11 rounded-xl font-bold text-sm transition-all duration-300 ${
                current === page
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-[#0F172A] border border-[#1e293b] text-dark-300 hover:border-orange-500/30 hover:text-orange-400'
              }`}
            >
              {page}
            </motion.button>
          )
        )}
        <button
          onClick={() => handlePageChange(current + 1)}
          disabled={current >= total}
          className="p-2.5 rounded-xl bg-[#0F172A] border border-[#1e293b] text-dark-300 hover:border-orange-500/30 hover:text-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#0F172A] to-[#020617]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMkM1NUUiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-emerald-500/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-emerald-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Premium Fitness Collection
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-tight">
              Train Like a{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Pro</span>
            </h1>
            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto">
              Elite-grade supplements & gym gear used by champions. Fuel your performance.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filter Bar - Glass effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative -mt-6 mb-8"
        >
          <div className="backdrop-blur-xl bg-[#0F172A]/80 border border-[#1e293b] rounded-2xl p-4 shadow-xl shadow-black/20">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchProducts()}
                  placeholder="Search 500+ products..."
                  className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder:text-dark-400 focus:outline-none focus:border-orange-500/50 focus:shadow-lg focus:shadow-orange-500/5 transition-all duration-300"
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <ProductSearchBar
                  onSearch={(query: string) => {
                    setSearchQuery(query);
                    setPagination(prev => ({ ...prev, page: 1 }));
                    setTimeout(() => fetchProducts(), 0);
                  }}
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-5 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-300 hover:text-orange-400 hover:border-orange-500/30 transition-all duration-300 lg:hidden"
                >
                  <SlidersHorizontal size={16} />
                  <span className="text-sm font-medium">Filters</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:w-64 xl:w-72 flex-shrink-0 hidden lg:block"
          >
            <div className="sticky top-8">
              <div className="backdrop-blur-xl bg-[#0F172A]/80 border border-[#1e293b] rounded-2xl p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-orange-400" />
                    Filters
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-orange-400/70 hover:text-orange-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <ProductFilters
                  filters={filters}
                  onChange={handleFiltersChange}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Result Count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-sm text-dark-400">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Loading...
                  </span>
                ) : (
                  <>
                    Showing <span className="text-white font-medium">{products.length}</span> of{' '}
                    <span className="text-white font-medium">{pagination.total}</span> products
                  </>
                )}
              </p>
              {!loading && products.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-dark-500">
                  <Zap size={12} className="text-orange-400" />
                  Results for "{filters.sort.replace('-', ' ')}"
                </div>
              )}
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/30 border border-red-500/30 text-red-300 px-5 py-3 rounded-xl mb-6 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Loading */}
            {loading ? (
              <LoadingSkeleton />
            ) : products.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-dark-800/50 border border-dark-700/50 mb-6">
                  <Dumbbell size={36} className="text-dark-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                <p className="text-dark-400 mb-8 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm
                    bg-gradient-to-r from-orange-500 to-orange-600 text-white
                    hover:from-orange-400 hover:to-orange-500
                    shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30
                    transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              /* Products Grid */
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.06 } },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Pagination */}
            {renderPagination()}
          </main>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-[#0F172A] border-r border-[#1e293b] p-6 overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-orange-400" />
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <ProductFilters
                  filters={filters}
                  onChange={(newFilters: any) => {
                    handleFiltersChange(newFilters);
                    setTimeout(() => setShowFilters(false), 300);
                  }}
                  onClose={() => setShowFilters(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
