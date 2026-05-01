import { useDeferredValue, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { HeroSkeleton, ProductGridSkeleton } from '../components/LoadingSkeletons';
import api, { getApiErrorMessage } from '../services/api';

const defaultFilters = {
  query: '',
  category: '',
  occasion: '',
  sort: 'featured',
};

export default function ProductsPage({ auth }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    query: searchParams.get('query') || defaultFilters.query,
    category: searchParams.get('category') || defaultFilters.category,
    occasion: searchParams.get('occasion') || defaultFilters.occasion,
    sort: searchParams.get('sort') || defaultFilters.sort,
  }));
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    setSearchParams(
      Object.fromEntries(
        Object.entries({
          query: filters.query.trim(),
          category: filters.category,
          occasion: filters.occasion,
          sort: filters.sort,
        }).filter(([, value]) => value),
      ),
      { replace: true },
    );
  }, [filters, setSearchParams]);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      setError('');

      try {
        const params = {
          sort: filters.sort === 'featured' ? 'rating' : filters.sort,
        };

        if (deferredQuery.trim()) {
          params.query = deferredQuery.trim();
        }
        if (filters.category) {
          params.category = filters.category;
        }
        if (filters.occasion) {
          params.occasion = filters.occasion;
        }

        const [productsResponse, categoriesResponse, occasionsResponse] = await Promise.all([
          api.get('/products', { params }),
          api.get('/categories'),
          api.get('/occasions'),
        ]);

        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        setOccasions(occasionsResponse.data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Unable to load the product catalog.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCatalog();
  }, [deferredQuery, filters.category, filters.occasion, filters.sort]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const activeOccasion = occasions.find((occasion) => occasion.slug === filters.occasion);
  const activeCategory = categories.find((category) => category.slug === filters.category);

  return (
    <section className="space-y-8">
      {isLoading ? (
        <HeroSkeleton />
      ) : (
        <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/85 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-brand-500 dark:text-brand-200">Catalog</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">Browse the full Sanvara collection</h1>
              <p className="mt-3 max-w-3xl text-base text-slate-600 dark:text-slate-300">
                Search across fashion, tech, accessories, and footwear with live filters for category, occasion, and sort order.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {activeCategory && (
                <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Category: {activeCategory.name}
                </span>
              )}
              {activeOccasion && (
                <span className="rounded-full bg-brand-50 px-4 py-2 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                  Occasion: {activeOccasion.name}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Filters</p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Refine products</h2>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Search</span>
              <input
                value={filters.query}
                onChange={(event) => handleFilterChange('query', event.target.value)}
                placeholder="Search products, brands, or subcategories"
                className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Category</span>
              <select
                value={filters.category}
                onChange={(event) => handleFilterChange('category', event.target.value)}
                className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Occasion</span>
              <select
                value={filters.occasion}
                onChange={(event) => handleFilterChange('occasion', event.target.value)}
                className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950"
              >
                <option value="">All occasions</option>
                {occasions.map((occasion) => (
                  <option key={occasion.id} value={occasion.slug}>
                    {occasion.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Sort</span>
              <select
                value={filters.sort}
                onChange={(event) => handleFilterChange('sort', event.target.value)}
                className="w-full bg-slate-50 px-4 py-3 dark:bg-slate-950"
              >
                <option value="featured">Top rated</option>
                <option value="priceAsc">Price: low to high</option>
                <option value="priceDesc">Price: high to low</option>
                <option value="rating">Highest rating</option>
              </select>
            </label>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900/85 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Live results</p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {isLoading ? 'Updating catalog...' : `${products.length} products found`}
              </h2>
            </div>
            <Link
              to="/"
              className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              Back to home
            </Link>
          </div>

          {error ? (
            <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-8 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
              <h3 className="text-xl font-semibold">Unable to load products</h3>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          ) : isLoading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/70 p-10 text-center dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No products match these filters</h3>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Try clearing one filter or search more broadly to see more results.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} auth={auth} />
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
