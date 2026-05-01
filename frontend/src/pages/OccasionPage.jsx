import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { HeroSkeleton, ProductGridSkeleton } from '../components/LoadingSkeletons';
import api, { getApiErrorMessage } from '../services/api';

export default function OccasionPage({ auth }) {
  const { occasionSlug } = useParams();
  const [occasion, setOccasion] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOccasion = async () => {
      setError('');
      setIsLoading(true);

      try {
        const [productsResponse, occasionsResponse] = await Promise.all([
          api.get('/products', { params: { occasion: occasionSlug, sort: 'rating' } }),
          api.get('/occasions'),
        ]);

        const selectedOccasion = occasionsResponse.data.find(
          (currentOccasion) => currentOccasion.slug === occasionSlug,
        );

        setProducts(productsResponse.data);
        setOccasion(
          selectedOccasion || {
            name: 'Occasion',
            description: 'Browse products curated for this occasion.',
          },
        );
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Unable to load occasion products.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadOccasion();
  }, [occasionSlug]);

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
        <div className="rounded-3xl border border-rose-200 bg-white/70 p-6 text-rose-700 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-100">
          <h2 className="text-xl font-semibold">Unable to load occasion products</h2>
          <p className="mt-2 text-sm">{error}</p>
          <Link to="/" className="mt-4 inline-block font-semibold text-brand-600 hover:text-brand-700">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-brand-500 dark:text-brand-200">Shop by occasion</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">{occasion?.name}</h1>
            <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
              {occasion?.description || 'Discover curated products for this occasion.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/products?occasion=${occasionSlug}`}
              className="rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Open filtered catalog
            </Link>
            <Link
              to="/"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Occasion products</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Browse curated finds</h2>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">{products.length} items</span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
            No products were found for this occasion yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} auth={auth} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
