import { useState, useEffect } from 'react';
import { getCategories, CategoryResult } from '@/actions/get-products';

interface UseCategoriesProps {
  slug: string;
}

interface UseCategoriesReturn {
  categories: CategoryResult[];
  loading: boolean;
  error: string | null;
}

const useCategories = ({ slug }: UseCategoriesProps): UseCategoriesReturn => {
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await getCategories({ slug });
        setCategories(result.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [slug]);

  return {
    categories,
    loading,
    error,
  };
};

export default useCategories;