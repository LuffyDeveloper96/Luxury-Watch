import { Product, Brand, ActivityLog } from '../models/index.js';
import { escapeRegex } from '../utils/regex.js';

export const getProducts = async (req, res) => {
  try {
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

    const query = { active: true };

    // Filter by Brand
    if (brand && brand !== 'All') {
      const bQuery = escapeRegex(brand.trim());
      query.$or = [
        { brand: new RegExp(`^${bQuery}$`, 'i') },
        { brandSlug: new RegExp(`^${bQuery}$`, 'i') }
      ];
    }

    // Filter by Category
    if (category && category !== 'All') {
      const cQuery = category.toLowerCase().trim();
      if (cQuery === 'men' || cQuery === "men's watches") {
        query.gender = { $in: ['Men', 'Unisex'] };
      } else if (cQuery === 'women' || cQuery === "women's watches") {
        query.gender = { $in: ['Women', 'Unisex'] };
      } else if (cQuery === 'chronographs') {
        query.category = /chrono/i;
      } else if (cQuery === 'skeletons') {
        query.category = /skeleton/i;
      } else if (cQuery === 'automatic') {
        query.$or = [
          { category: /automatic/i },
          { 'specs.movement': /automatic/i }
        ];
      } else {
        query.category = new RegExp(escapeRegex(cQuery), 'i');
      }
    }

    // Filter by Gender
    if (gender && gender !== 'All') {
      const gQuery = escapeRegex(gender.trim());
      query.gender = { $in: [new RegExp(`^${gQuery}$`, 'i'), 'Unisex'] };
    }

    // Filter by Price Range
    if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Math.max(0, Number(minPrice));
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Math.max(0, Number(maxPrice));
      }
    }

    // Filter by Movement
    if (movement && movement !== 'All') {
      query['specs.movement'] = new RegExp(escapeRegex(movement.trim()), 'i');
    }

    // Filter by Dial Color
    if (dialColor && dialColor !== 'All') {
      const dQuery = new RegExp(escapeRegex(dialColor.trim()), 'i');
      query.$or = [
        { 'specs.dialColor': dQuery },
        { subtitle: dQuery }
      ];
    }

    // Filter by Strap Material
    if (strapMaterial && strapMaterial !== 'All') {
      const sQuery = new RegExp(escapeRegex(strapMaterial.trim()), 'i');
      query.$or = [
        { 'specs.strapMaterial': sQuery },
        { 'specs.strap': sQuery }
      ];
    }

    // Filter by Rating
    if (rating) {
      query.rating = { $gte: Math.max(0, Math.min(5, Number(rating))) };
    }

    // Feature Flags
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    if (isBestSeller === 'true') {
      query.isBestSeller = true;
    }
    if (isNewArrival === 'true') {
      query.isNewArrival = true;
    }

    // Full-Text Search across fields with ReDoS protection
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const q = new RegExp(safeSearch, 'i');
      const searchOr = [
        { name: q },
        { brand: q },
        { category: q },
        { sku: q },
        { modelNumber: q },
        { description: q },
        { subtitle: q }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    // Determine Sort options
    let sort = {};
    if (sortBy === 'price-low') {
      sort = { price: 1 };
    } else if (sortBy === 'price-high') {
      sort = { price: -1 };
    } else if (sortBy === 'rating') {
      sort = { rating: -1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'discount') {
      sort = { discountPercent: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sort).skip(skip).limit(limitNum).lean()
    ]);

    return res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      products
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductByIdOrSlug = async (req, res) => {
  try {
    const { id } = req.params;
    const clean = id.trim();
    const safeClean = escapeRegex(clean);

    const product = await Product.findOne({
      $or: [
        { id: clean },
        { slug: clean },
        { sku: new RegExp(`^${safeClean}$`, 'i') }
      ]
    }).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Timepiece not found in vault.' });
    }
    return res.json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, suggestions: [] });
    }

    const term = q.trim();
    const safeTerm = escapeRegex(term);
    const regex = new RegExp(safeTerm, 'i');

    const [matchedBrands, matchedProducts] = await Promise.all([
      Brand.find({ name: regex, active: true }).limit(3).lean(),
      Product.find({
        active: true,
        $or: [{ name: regex }, { brand: regex }]
      }).limit(5).lean()
    ]);

    const formattedBrands = matchedBrands.map(b => ({
      type: 'brand',
      text: b.name,
      slug: b.slug
    }));

    const formattedProducts = matchedProducts.map(p => ({
      type: 'product',
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      image: p.images?.[0]
    }));

    return res.json({
      success: true,
      suggestions: [...formattedBrands, ...formattedProducts]
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const newProductData = req.body;
    if (!newProductData.name || newProductData.price === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const slug = newProductData.slug || newProductData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = newProductData.id || `lw-${slug}-${Date.now().toString().slice(-4)}`;

    // Media validation (Maximum 5 media items)
    let validatedMedia = [];
    if (newProductData.media) {
      if (!Array.isArray(newProductData.media)) {
        return res.status(400).json({ success: false, message: 'Media must be an array.' });
      }
      if (newProductData.media.length > 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 media items allowed per product.' });
      }
      for (const item of newProductData.media) {
        if (!item || !item.url || typeof item.url !== 'string') {
          return res.status(400).json({ success: false, message: 'Each media item must have a valid URL.' });
        }
        const itemType = item.type === 'video' ? 'video' : 'image';
        validatedMedia.push({
          type: itemType,
          url: item.url.trim(),
          thumbnail: item.thumbnail || '',
          order: typeof item.order === 'number' ? item.order : validatedMedia.length
        });
      }
    } else if (Array.isArray(newProductData.images) && newProductData.images.length > 0) {
      validatedMedia = newProductData.images.slice(0, 5).map((img, idx) => ({
        type: typeof img === 'string' && /\.(mp4|webm|ogg|mov)$/i.test(img) ? 'video' : 'image',
        url: typeof img === 'string' ? img.trim() : (img?.url || ''),
        thumbnail: '',
        order: idx
      }));
    }

    const syncedImages = validatedMedia.length > 0 
      ? validatedMedia.map(m => m.url) 
      : (Array.isArray(newProductData.images) ? newProductData.images.slice(0, 5) : []);

    const productToInsert = {
      ...newProductData,
      media: validatedMedia,
      images: syncedImages,
      id,
      slug,
      rating: newProductData.rating || 5.0,
      reviewsCount: newProductData.reviewsCount || 0,
      stock: Number(newProductData.stock) || 5,
      price: Number(newProductData.price),
      comparePrice: newProductData.comparePrice ? Number(newProductData.comparePrice) : undefined,
      sku: newProductData.sku || `LW-${Math.floor(1000 + Math.random() * 9000)}`,
      active: true,
      createdAt: new Date()
    };

    const created = await Product.create(productToInsert);

    await ActivityLog.create({
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

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const existing = await Product.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Timepiece not found.' });
    }

    // Media validation (Maximum 5 media items)
    if (updates.media !== undefined) {
      if (!Array.isArray(updates.media)) {
        return res.status(400).json({ success: false, message: 'Media must be an array.' });
      }
      if (updates.media.length > 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 media items allowed per product.' });
      }
      const validatedMedia = [];
      for (const item of updates.media) {
        if (!item || !item.url || typeof item.url !== 'string') {
          return res.status(400).json({ success: false, message: 'Each media item must have a valid URL.' });
        }
        const itemType = item.type === 'video' ? 'video' : 'image';
        validatedMedia.push({
          type: itemType,
          url: item.url.trim(),
          thumbnail: item.thumbnail || '',
          order: typeof item.order === 'number' ? item.order : validatedMedia.length
        });
      }
      updates.media = validatedMedia;
      updates.images = validatedMedia.map(m => m.url);
    } else if (updates.images !== undefined && Array.isArray(updates.images)) {
      if (updates.images.length > 5) {
        return res.status(400).json({ success: false, message: 'Maximum 5 media items allowed per product.' });
      }
      updates.media = updates.images.slice(0, 5).map((img, idx) => ({
        type: typeof img === 'string' && /\.(mp4|webm|ogg|mov)$/i.test(img) ? 'video' : 'image',
        url: typeof img === 'string' ? img.trim() : (img?.url || ''),
        thumbnail: '',
        order: idx
      }));
    }

    const updated = await Product.findOneAndUpdate(
      { _id: existing._id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    await ActivityLog.create({
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

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta, absolute } = req.body;

    const existing = await Product.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Timepiece not found.' });
    }

    let newStock = existing.stock;
    if (absolute !== undefined) {
      newStock = Math.max(0, Number(absolute));
    } else if (delta !== undefined) {
      newStock = Math.max(0, existing.stock + Number(delta));
    }

    const updated = await Product.findOneAndUpdate(
      { _id: existing._id },
      { $set: { stock: newStock, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    await ActivityLog.create({
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

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Product.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Timepiece not found.' });
    }

    await Product.deleteOne({ _id: existing._id });

    await ActivityLog.create({
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
