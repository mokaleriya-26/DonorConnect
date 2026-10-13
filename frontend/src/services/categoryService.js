import { getItem, setItem, STORAGE_KEYS } from './storage';
import { apiClient } from './apiClient';

export const categoryService = {
  syncFromBackend: async () => {
    try {
      const res = await apiClient.get('/categories?all=true');
      if (res?.categories && Array.isArray(res.categories)) {
        setItem(STORAGE_KEYS.CATEGORIES, res.categories);
        return res.categories;
      }
    } catch {
      // Offline fallback
    }
    return getItem(STORAGE_KEYS.CATEGORIES, []);
  },

  getAllCategories: () => {
    return getItem(STORAGE_KEYS.CATEGORIES, []);
  },

  getActiveCategories: () => {
    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    return cats.filter(c => c.active !== false && c.isActive !== false);
  },

  getCategoryBySlug: (slug) => {
    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    return cats.find(c => c.slug === slug || c.id === slug) || null;
  },

  addCategory: async (catData) => {
    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    let newCat = null;

    try {
      const res = await apiClient.post('/categories', catData);
      if (res?.category) newCat = res.category;
    } catch (err) {
      if (err.status !== 0) throw err;
    }

    if (!newCat) {
      const slug = (catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim();
      newCat = {
        id: `cat-${Date.now()}`,
        slug,
        name: catData.name,
        shortDescription: catData.shortDescription || 'Category on EventSphere.',
        iconName: catData.iconName || 'Sparkles',
        color: catData.color || '#7541C8',
        badgeText: catData.name,
        eventCount: 0,
        active: true,
        coverImage: catData.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
      };
    }

    const updated = [...cats, newCat];
    setItem(STORAGE_KEYS.CATEGORIES, updated);
    return newCat;
  },

  updateCategory: async (id, updates) => {
    try {
      const res = await apiClient.put(`/categories/${id}`, updates);
      if (res?.category) {
        const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
        const idx = cats.findIndex(c => c.id === id);
        if (idx !== -1) cats[idx] = res.category;
        setItem(STORAGE_KEYS.CATEGORIES, [...cats]);
        return res.category;
      }
    } catch (err) {
      if (err.status !== 0) throw err;
    }

    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    const index = cats.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');

    cats[index] = { ...cats[index], ...updates };
    setItem(STORAGE_KEYS.CATEGORIES, [...cats]);
    return cats[index];
  },

  toggleCategoryActive: async (id) => {
    try {
      const res = await apiClient.patch(`/categories/${id}/toggle-active`);
      if (res?.category) {
        const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
        const idx = cats.findIndex(c => c.id === id);
        if (idx !== -1) cats[idx] = res.category;
        setItem(STORAGE_KEYS.CATEGORIES, [...cats]);
        return res.category;
      }
    } catch (err) {
      if (err.status !== 0) throw err;
    }

    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    const cat = cats.find(c => c.id === id);
    if (!cat) throw new Error('Category not found');

    cat.active = !cat.active;
    setItem(STORAGE_KEYS.CATEGORIES, [...cats]);
    return cat;
  },

  deleteCategory: async (id) => {
    try {
      await apiClient.delete(`/categories/${id}`);
    } catch (err) {
      if (err.status !== 0) throw err;
    }

    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    const filtered = cats.filter(c => c.id !== id);
    setItem(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  }
};
