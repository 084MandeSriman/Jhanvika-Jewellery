import { useEffect, useState, useCallback } from "react";
import { ProductAPI, CategoryAPI, ContentAPI } from "../api/services";

// Generic fetch-state hook to avoid repeating loading/error boilerplate
function useAsync(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const run = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((res) => {
        if (!cancelled) setState({ data: res.data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: err });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { ...state, refetch: run };
}

/** Product list — mirrors what `products` array used to provide, with optional server-side filters. */
export function useProducts(filters = {}) {
  const key = JSON.stringify(filters);
  const { data, loading, error } = useAsync(() => ProductAPI.list(filters), [key]);
  return { products: data || [], loading, error };
}

export function useProduct(id) {
  const { data, loading, error } = useAsync(() => ProductAPI.get(id), [id]);
  return { product: data, loading, error };
}

export function useRelatedProducts(id) {
  const { data, loading, error } = useAsync(() => ProductAPI.related(id), [id]);
  return { related: data || [], loading, error };
}

export function useCategories() {
  const { data, loading, error } = useAsync(() => CategoryAPI.list(), []);
  return { categories: data || [], loading, error };
}

export function useTestimonials() {
  const { data, loading, error } = useAsync(() => ContentAPI.testimonials(), []);
  return { testimonials: data || [], loading, error };
}

export function useHeroSlides() {
  const { data, loading, error } = useAsync(() => ContentAPI.heroSlides(), []);
  return { heroSlides: data || [], loading, error };
}

export function useProductImages(id) {
  const { data, loading, error } = useAsync(() => ProductAPI.images(id), [id]);
  return { images: data || [], loading, error };
}
