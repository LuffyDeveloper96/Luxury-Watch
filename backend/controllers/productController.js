import { db } from '../config/db.js';

export const getProducts = (req, res) => {
  try {
    let products = db.getCollection('products');
    const { category, search, sortBy } = req.query;

    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const product = db.findById('products', id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Timepiece not found in vault.' });
    }
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = (req, res) => {
  try {
    const newProductData = req.body;
    if (!newProductData.name || !newProductData.price) {
      return res.status(400).json({ success: false, message: 'Timepiece name and price are required.' });
    }

    const id = newProductData.id || `ak-${(newProductData.category || 'watch').toLowerCase().slice(0, 4)}-${Date.now().toString().slice(-4)}`;
    const productToInsert = {
      ...newProductData,
      id,
      rating: newProductData.rating || 5.0,
      reviewsCount: newProductData.reviewsCount || 0,
      stock: Number(newProductData.stock) || 5,
      price: Number(newProductData.price),
      comparePrice: newProductData.comparePrice ? Number(newProductData.comparePrice) : undefined,
      sku: newProductData.sku || `AK-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };

    const created = db.insert('products', productToInsert);

    // Log Activity
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Master Admin added new masterpiece: "${created.name}" to catalog`,
      time: 'Just now',
      type: 'admin'
    });

    return res.status(201).json({
      success: true,
      message: 'Timepiece created successfully.',
      product: created
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = db.findById('products', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Timepiece not found.' });
    }

    const updated = db.update('products', id, updates);

    // Log Activity
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Admin updated horology specifications for "${updated.name}"`,
      time: 'Just now',
      type: 'admin'
    });

    return res.json({
      success: true,
      message: 'Timepiece updated successfully.',
      product: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStock = (req, res) => {
  try {
    const { id } = req.params;
    const { delta, absolute } = req.body;

    const existing = db.findById('products', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Timepiece not found.' });
    }

    let newStock = existing.stock;
    if (absolute !== undefined) {
      newStock = Math.max(0, Number(absolute));
    } else if (delta !== undefined) {
      newStock = Math.max(0, existing.stock + Number(delta));
    }

    const updated = db.update('products', id, { stock: newStock });

    // Log Activity
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Vault stock updated for "${updated.name}" (${newStock} available)`,
      time: 'Just now',
      type: 'admin'
    });

    return res.json({
      success: true,
      message: 'Stock updated successfully.',
      product: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findById('products', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Timepiece not found.' });
    }

    const removed = db.delete('products', id);

    // Log Activity
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Admin removed "${existing.name}" from catalog`,
      time: 'Just now',
      type: 'admin'
    });

    return res.json({
      success: true,
      message: 'Timepiece deleted successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
