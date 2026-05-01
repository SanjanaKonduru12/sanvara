import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MoodCard from '../components/MoodCard';
import ProductCard from '../components/ProductCard';
import { HeroSkeleton, ProductGridSkeleton } from '../components/LoadingSkeletons';
import api, { getApiErrorMessage } from '../services/api';

async function loadHomeFallback() {
  const [categoriesResponse, occasionsResponse, featuredResponse, newestResponse] = await Promise.all([
    api.get('/categories'),
    api.get('/occasions'),
    api.get('/products', { params: { sort: 'rating' } }),
    api.get('/products'),
  ]);

  return {
    categories: categoriesResponse.data,
    moods: occasionsResponse.data,
    featuredProducts: featuredResponse.data.slice(0, 6),
    newestProducts: newestResponse.data.slice(0, 8),
  };
}

export default function HomePage({ auth }) {
  const [home, setHome] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadHome = async () => {
      setError('');
      setIsLoading(true);

      try {
        const response = await api.get('/home');
        setHome(response.data);
      } catch (requestError) {
        console.warn('[HomePage] /home failed, trying fallback requests.', requestError);

        try {
          const fallbackHome = await loadHomeFallback();
          setHome(fallbackHome);
        } catch (fallbackError) {
          setError(getApiErrorMessage(fallbackError, 'Unable to load homepage.'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadHome();
  }, []);

  const handleMoodSelect = (mood) => {
    navigate(`/occasions/${mood.slug}`);
  };

  if (isLoading) {
    return (
      <section className="space-y-8">
        <HeroSkeleton />
        <ProductGridSkeleton count={6} />
      </section>
    );
  }

  if (error || !home) {
    return (
      <div className="mx-auto max-w-4xl rounded-[32px] border border-rose-200 bg-rose-50 p-8 shadow-soft dark:border-rose-500/30 dark:bg-rose-500/10">
        <div className="rounded-3xl border border-rose-200/80 bg-white/70 p-6 text-rose-700 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-100">
          <h2 className="text-xl font-semibold">Unable to load home data</h2>
          <p className="mt-2 text-sm">{error || 'The homepage data is unavailable right now.'}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-10">
      <div className="overflow-hidden rounded-[36px] border border-slate-200/70 bg-[linear-gradient(135deg,_rgba(37,99,235,0.95),_rgba(15,23,42,0.92)),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_40%)] px-8 py-12 text-white shadow-soft sm:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_360px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-100">Fashion intelligence</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Discover your mood, shop the right collection, and move faster.</h1>
            <p className="mt-5 max-w-2xl text-base text-slate-100/90">
              Browse a richer catalog across clothing, electronics, accessories, and footwear with curated occasion-based shopping that feels instant.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Explore all products
              </Link>
              <Link
                to="/products?sort=priceAsc"
                className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Budget-friendly picks
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-200">Live catalog</p>
              <h2 className="mt-2 text-3xl font-semibold">{home.newestProducts.length + home.featuredProducts.length}+ featured highlights</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-100/85">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Categories</p>
                <p className="mt-2 text-2xl font-semibold">{home.categories.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Occasions</p>
                <p className="mt-2 text-2xl font-semibold">{home.moods.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Occasion-based shopping</p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Shop by occasion</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose a vibe and jump into a filtered collection</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {home.moods.map((mood) => (
                <MoodCard key={mood.id} mood={mood} onSelect={handleMoodSelect} />
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Featured</p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Top picks for you</h2>
              </div>
              <Link to="/products" className="text-sm font-semibold text-brand-600 transition hover:text-brand-500">
                View catalog
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {home.featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} auth={auth} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Need inspiration?</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Trending categories</h3>
          </div>
          <div className="space-y-4">
            {home.categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="block rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-brand-300 hover:bg-white dark:border-slate-700 dark:bg-slate-950 dark:hover:border-brand-400"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{category.name}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
              </Link>
            ))}
          </div>

        </aside>
      </div>

      <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">New arrivals</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Latest products</h2>
          </div>
          <Link to="/products?sort=rating" className="text-sm font-semibold text-brand-600 transition hover:text-brand-500">
            Browse more arrivals
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {home.newestProducts.map((product) => (
            <ProductCard key={product.id} product={product} auth={auth} />
          ))}
        </div>
      </section>
    </section>
  );
}
