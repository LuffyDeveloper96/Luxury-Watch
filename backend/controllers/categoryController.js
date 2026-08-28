import { Category } from '../models/index.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ displayOrder: 1, name: 1 }).lean();
    return res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl, displayOrder } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `cat-${slug}`;

    const newCategory = {
      id,
      name,
      slug,
      description: description || '',
      imageUrl: imageUrl || '',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : Date.now(),
      active: true,
      createdAt: new Date()
    };

    const saved = await Category.create(newCategory);

    return res.status(201).json({ success: true, message: 'Category created successfully.', category: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await Category.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const updated = await Category.findOneAndUpdate(
      { _id: existing._id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return res.json({ success: true, message: 'Category updated successfully.', category: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Category.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    await Category.deleteOne({ _id: existing._id });
    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
