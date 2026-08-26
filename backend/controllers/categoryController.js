import { db } from '../config/db.js';

export const getCategories = (req, res) => {
  try {
    const categories = db.getCollection('categories');
    const sorted = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return res.json({
      success: true,
      count: sorted.length,
      categories: sorted
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createCategory = (req, res) => {
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
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('categories', newCategory);

    return res.status(201).json({ success: true, message: 'Category created successfully.', category: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = db.findById('categories', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const updated = db.update('categories', id, updates);
    return res.json({ success: true, message: 'Category updated successfully.', category: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategory = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findById('categories', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    db.delete('categories', id);
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
