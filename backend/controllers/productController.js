import { db } from '../config/db.js';

export const getProducts = (req, res) => {
  try {
    let products = db.getCollection('products');
    const {
      category,
      brand,
      gender,
      minPrice,
      maxPrice,
      movement,
      dialColor,
      strapMaterial,
      waterResistance,
      rating,
      search,
      sortBy,
      isFeatured,
      isBestSeller,
      isNewArrival,
      page = 1,
      limit = 50
    } = req.query;

    // Filter by Brand
    if (brand && brand !== 'All') {
      const bQuery = brand.toLowerCase().trim();
      products = products.filter(p => (p.brand && p.brand.toLowerCase() === bQuery) || (p.brandSlug && p.brandSlug.toLowerCase() === bQuery));
    }

    // Filter by Category
    if (category && category !== 'All') {
      const cQuery = category.toLowerCase().trim();
      products = products.filter(p => {
        if (!p.category) return false;
        const pCat = p.category.toLowerCase();
        if (pCat === cQuery || pCat.includes(cQuery)) return true;
        // Aliases
        if ((cQuery === 'men' || cQuery === "men's watches") && (p.gender === 'Men' || p.gender === 'Unisex')) return true;
        if ((cQuery === 'women' || cQuery === "women's watches") && (p.gender === 'Women' || p.gender === 'Unisex')) return true;
        if (cQuery === 'chronographs' && pCat.includes('chrono')) return true;
        if (cQuery === 'skeletons' && pCat.includes('skeleton')) return true;
        if (cQuery === 'automatic' && (pCat.includes('automatic') || p.specs?.movement?.toLowerCase().includes('automatic'))) return true;
        return false;
      });
    }

    // Filter by Gender
    if (gender && gender !== 'All') {
      const gQuery = gender.toLowerCase();
      products = products.filter(p => p.gender && (p.gender.toLowerCase() === gQuery || p.gender.toLowerCase() === 'unisex'));
    }

    // Filter by Price Range
    if (minPrice !== undefined && minPrice !== '') {
      products = products.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    // Filter by Movement
    if (movement && movement !== 'All') {
      const mQuery = movement.toLowerCase();
      products = products.filter(p => p.specs?.movement?.toLowerCase().includes(mQuery));
    }

    // Filter by Dial Color
    if (dialColor && dialColor !== 'All') {
      const dQuery = dialColor.toLowerCase();
      products = products.filter(p => p.specs?.dialColor?.toLowerCase().includes(dQuery) || p.subtitle?.toLowerCase().includes(dQuery));
    }

    // Filter by Strap Material
    if (strapMaterial && strapMaterial !== 'All') {
      const sQuery = strapMaterial.toLowerCase();
      products = products.filter(p => p.specs?.strapMaterial?.toLowerCase().includes(sQuery) || p.specs?.strap?.toLowerCase().includes(sQuery));
    }

    // Filter by Rating
    if (rating) {
      products = products.filter(p => (p.rating || 0) >= Number(rating));
    }

    // Filter by Feature flags
    if (isFeatured === 'true') {
      products = products.filter(p => p.isFeatured);
    }
    if (isBestSeller === 'true') {
      products = products.filter(p => p.isBestSeller);
    }
    if (isNewArrival === 'true') {
      products = products.filter(p => p.isNewArrival);
    }

    // Full-Text Search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.modelNumber?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.subtitle?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'discount') {
      products.sort((a, b) => {
        const discA = a.comparePrice ? ((a.comparePrice - a.price) / a.comparePrice) : 0;
        const discB = b.comparePrice ? ((b.comparePrice - b.price) / b.comparePrice) : 0;
        return discB - discA;
      });
    }

    const total = products.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const paginated = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      success: true,
      count: paginated.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      products: paginated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductByIdOrSlug = (req, res) => {
  try {
    const { id } = req.params;
    const clean = id.trim();
    const products = db.getCollection('products');
    const product = products.find(
      p => p.id === clean || p.slug === clean || p.sku?.toUpperCase() === clean.toUpperCase()
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Timepiece not found in vault.' });
    }
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getSearchSuggestions = (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, suggestions: [] });
    }

    const term = q.toLowerCase().trim();
    const products = db.getCollection('products');
    const brands = db.getCollection('brands');

    const matchedBrands = brands
      .filter(b => b.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map(b => ({ type: 'brand', text: b.name, slug: b.slug }));

    const matchedProducts = products
      .filter(p => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term))
      .slice(0, 5)
      .map(p => ({ type: 'product', id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.images?.[0] }));

    return res.json({
      success: true,
      suggestions: [...matchedBrands, ...matchedProducts]
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = (req, res) => {
  try {
    const newProductData = req.body;
    if (!newProductData.name || newProductData.price === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const slug = newProductData.slug || newProductData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = newProductData.id || `lw-${slug}-${Date.now().toString().slice(-4)}`;

    const productToInsert = {
      ...newProductData,
      id,
      slug,
      rating: newProductData.rating || 5.0,
      reviewsCount: newProductData.reviewsCount || 0,
      stock: Number(newProductData.stock) || 5,
      price: Number(newProductData.price),
      comparePrice: newProductData.comparePrice ? Number(newProductData.comparePrice) : undefined,
      sku: newProductData.sku || `LW-${Math.floor(1000 + Math.random() * 9000)}`,
      active: true,
      createdAt: new Date().toISOString()
    };

    const created = db.insert('products', productToInsert);

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Master Administrator catalogued: "${created.name}"`,
      time: 'Just now',
      type: 'admin'
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
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

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Specifications updated for "${updated.name}"`,
      time: 'Just now',
      type: 'admin'
    });

    return res.json({
      success: true,
      message: 'Product updated successfully.',
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

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Vault stock updated for "${updated.name}" (${newStock} available)`,
      time: 'Just now',
      type: 'admin'
    });

    return res.json({
      success: true,
      message: 'Stock updated successfully.',
      stock: newStock,
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

    db.delete('products', id);

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

export default {
  getProducts,
  getProductByIdOrSlug,
  getSearchSuggestions,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct
};
