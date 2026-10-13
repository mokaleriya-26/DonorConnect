import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  toggleCategoryActive,
  deleteCategory
} from '../services/category.service.js';
import { getPublicEvents } from '../services/event.service.js';

export const listCategories = async (req, res, next) => {
  try {
    const onlyActive = req.query.all !== 'true';
    const categories = await getAllCategories(onlyActive);
    res.status(200).json({
      success: true,
      categories
    });
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await getCategoryBySlug(req.params.slug);
    res.status(200).json({
      success: true,
      category
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoryEvents = async (req, res, next) => {
  try {
    const category = await getCategoryBySlug(req.params.slug);
    const result = await getPublicEvents({
      ...req.query,
      category: category.id
    });
    res.status(200).json({
      success: true,
      category,
      events: result.events,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({
      success: true,
      category,
      message: 'Category created successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    res.status(200).json({
      success: true,
      category,
      message: 'Category updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const toggleActive = async (req, res, next) => {
  try {
    const category = await toggleCategoryActive(req.params.id);
    res.status(200).json({
      success: true,
      category,
      message: `Category is now ${category.active ? 'active' : 'inactive'}.`
    });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await deleteCategory(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
      data: result
    });
  } catch (err) {
    next(err);
  }
};
