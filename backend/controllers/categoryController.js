import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getCategories = async (req, res) => {
  const categories = await Category.find();
  return successResponse(res, categories);
};

export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return errorResponse(res, 'Category not found', 404);
  }
  return successResponse(res, category);
};

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return errorResponse(res, 'Category name is required', 400);
  }
  const existing = await Category.findOne({ name });
  if (existing) {
    return errorResponse(res, 'Category already exists', 400);
  }
  const category = await Category.create({ name, description });
  return successResponse(res, category, 'Category created', 201);
};

export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return errorResponse(res, 'Category not found', 404);
  }
  category.name = req.body.name || category.name;
  category.description = req.body.description || category.description;
  const updated = await category.save();
  return successResponse(res, updated, 'Category updated');
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return errorResponse(res, 'Category not found', 404);
  }
  await category.remove();
  return successResponse(res, {}, 'Category deleted');
};
