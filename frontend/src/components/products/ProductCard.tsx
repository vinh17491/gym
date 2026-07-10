import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { useProductsStore } from '../../stores/productsStore';
import { formatCurrency } from '../../lib/utils';

interface ProductCardProps {
  product: {
    id: number;
    product_name?: string;
    name?: string;
    price: number;
    sale_price?: number;
    original_price?: number;
    main_image?: string;
    rating?: number;
    review_count?: number;
    slug?: string;
    is_featured?: boolean;
    is_on_sale?: boolean;
    brand?: string;
    brand_name?: string;
    category?: string;
    category_name?: string;
    category_slug?: string;
    weight?: number;
    flavor?: string;
    color?: string;
    size?: string;
    tags?: string;
    stock?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useProductsStore();
  const name = product.product_name || product.name || '';
  const brand = product.brand || product.brand_name || '';
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.sale_price! / product.price) * 100) : 0;
  const wishlisted = isInWishlist(product.id);
  const outOfStock = product.stock !== undefined && product.stock === 0;
  const isNew = product.is_on_sale === false && !hasDiscount && !product.is_featured;
  const displayPrice = hasDiscount ? product.sale_price! : product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group relative bg-[#0F172A] border border-[#1e293b] rounded-2xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/30 transition-all duration-500 ease-out"
    >
      {/* Image Container */}
      <Link to={`/products/${product.slug || product.id}`} className="block relative overflow-hidden aspect-[4/5]">
        <img
          src={product.main_image || '/placeholder-product.png'}
          alt={name}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${outOfStock ? 'opacity-40 grayscale' : ''}`}
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
        />
        {/* Gradient Overlay từ dưới lên */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges - Glassmorphism */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xl bg-gradient-to-r from-orange-500/80 to-orange-600/80 text-white border border-orange-400/30 shadow-lg shadow-orange-500/20">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xl bg-gradient-to-r from-yellow-500/80 to-amber-600/80 text-white border border-yellow-400/30 shadow-lg shadow-yellow-500/20 flex items-center gap-1">
              <Zap size={10} /> HOT
            </span>
          )}
          {isNew && (
            <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xl bg-gradient-to-r from-emerald-500/80 to-green-600/80 text-white border border-emerald-400/30 shadow-lg shadow-emerald-500/20">
              NEW
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-xl bg-black/60 text-white border border-white/10">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        {brand && (
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-400/80">
            {brand}
          </p>
        )}

        {/* Product Name */}
        <Link to={`/products/${product.slug || product.id}`}>
          <h3 className="font-bold text-sm leading-tight text-white group-hover:text-orange-400 transition-colors duration-300 line-clamp-2">
            {name}
          </h3>
        </Link>

        {/* Variant Chips */}
        {(product.weight || product.flavor || product.color || product.size) && (
          <div className="flex flex-wrap gap-1.5">
            {product.weight && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-dark-800/80 text-dark-300 border border-dark-700/50">
                {product.weight}lb
              </span>
            )}
            {product.flavor && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-300 border border-purple-500/20">
                {product.flavor}
              </span>
            )}
            {product.color && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-900/30 text-sky-300 border border-sky-500/20">
                {product.color}
              </span>
            )}
            {product.size && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-500/20">
                {product.size}
              </span>
            )}
          </div>
        )}

        {/* Rating + Price */}
        <div className="flex items-end justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-orange-400">
                  {formatCurrency(product.sale_price!)}
                </span>
                <span className="text-xs text-dark-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-extrabold text-white">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={10}
                    className={star <= Math.round(product.rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-dark-600'}
                  />
                ))}
              </div>
              <span className="text-[10px] font-medium text-dark-400">
                {product.review_count ? `(${product.review_count})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - ẩn/hiện khi hover */}
        <div className="flex gap-2 pt-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
          <button
            onClick={() => addToCart(product.id)}
            disabled={outOfStock}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              bg-gradient-to-r from-orange-500 to-orange-600 text-white
              hover:from-orange-400 hover:to-orange-500
              disabled:from-dark-700 disabled:to-dark-700 disabled:text-dark-400 disabled:cursor-not-allowed
              shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30
              transition-all duration-300"
          >
            <ShoppingCart size={14} />
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2.5 rounded-xl border transition-all duration-300 ${
              wishlisted
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-dark-800/50 border-dark-700/50 text-dark-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
            }`}
          >
            <Heart size={16} className={wishlisted ? 'fill-red-400' : ''} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
