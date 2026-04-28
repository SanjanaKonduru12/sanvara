import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { HeroSkeleton, ProductGridSkeleton } from '../components/LoadingSkeletons';
import api, { getApiErrorMessage } from '../services/api';

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategoryProducts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get('/products', { params: { category: categorySlug } }),
          api.get('/categories'),
        ]);

        setProducts(productsResponse.data);

        const matchedCategory = categoriesResponse.data.find(
          (cat) => cat.slug === categorySlug
        );
        setCategoryName(matchedCategory?.name || categorySlug);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Unable to load category products.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryProducts();
  }, [categorySlug]);

  if (isLoading) {
    return (
      <section className="space-y-8">
        <HeroSkeleton />
        <ProductGridSkeleton count={6} />
      </section>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl rounded-[32px] border border-rose-200 bg-rose-50 p-8 shadow-soft dark:border-rose-500/30 dark:bg-rose-500/10">
        <h2 className="text-xl font-semibold text-rose-800 dark:text-rose-100">Unable to load category</h2>
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-200">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/85 sm:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-brand-500 dark:text-brand-200">Category</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">{categoryName}</h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          {products.length} product{products.length !== 1 ? 's' : ''} found in this category
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/products" className="btn-secondary">
            All Products
          </Link>
          <Link to="/" className="btn-ghost">
            Back to Home
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/70 p-10 text-center dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No products in this category</h3>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Check back later or browse other categories.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
