import { getItem, setItem, STORAGE_KEYS } from './storage';

export const categoryService = {
  getAllCategories: () => {
    return getItem(STORAGE_KEYS.CATEGORIES, []);
  },

  getActiveCategories: () => {
    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    return cats.filter(c => c.active !== false);
  },

  getCategoryBySlug: (slug) => {
    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    return cats.find(c => c.slug === slug || c.id === slug) || null;
  },

  addCategory: (catData) => {
    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    const slug = (catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).trim();

    if (cats.some(c => c.slug.toLowerCase() === slug.toLowerCase())) {
      throw new Error(`Category slug "${slug}" already exists. Slugs must be unique.`);
    }

    const newCat = {
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

    const updated = [...cats, newCat];
    setItem(STORAGE_KEYS.CATEGORIES, updated);
    return newCat;
  },

  updateCategory: (id, updates) => {
    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    const index = cats.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');

    if (updates.slug) {
      const duplicate = cats.find(c => c.id !== id && c.slug.toLowerCase() === updates.slug.toLowerCase());
      if (duplicate) {
        throw new Error(`Category slug "${updates.slug}" is already in use.`);
      }
    }

    cats[index] = { ...cats[index], ...updates };
    setItem(STORAGE_KEYS.CATEGORIES, [...cats]);
    return cats[index];
  },

  toggleCategoryActive: (id) => {
    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    const cat = cats.find(c => c.id === id);
    if (!cat) throw new Error('Category not found');

    cat.active = !cat.active;
    setItem(STORAGE_KEYS.CATEGORIES, [...cats]);
    return cat;
  },

  deleteCategory: (id) => {
    const events = getItem(STORAGE_KEYS.EVENTS, []);
    const hasEvents = events.some(e => e.categoryId === id);
    if (hasEvents) {
      throw new Error('Cannot delete category: events are currently assigned to it. Please reassign or delete those events first, or deactivate the category instead.');
    }

    const cats = getItem(STORAGE_KEYS.CATEGORIES, []);
    const filtered = cats.filter(c => c.id !== id);
    setItem(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  }
};
