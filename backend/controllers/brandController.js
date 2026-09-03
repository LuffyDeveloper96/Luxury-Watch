import fs from 'fs';
import path from 'path';
import { Brand, ActivityLog } from '../models/index.js';
import { escapeRegex } from '../utils/regex.js';

const STORE_JSON_PATH = path.resolve(process.cwd(), 'backend/data/store.json');

// Helper to normalize and sync brand document
const normalizeBrand = (b) => {
  const loc = b.location || (b.origin ? b.origin.split('•')[0].trim() : 'Switzerland');
  const est = b.established || b.founded || '';
  const orig = b.origin || (est ? `${loc} • Est. ${est}` : loc);
  const feat = b.featuredCollection || b.model || b.hallmark || '';
  const desc = b.description || b.subtitle || b.tagline || '';
  const bdg = b.badge || b.tag || 'ICON';
  const img = b.image || b.bannerUrl || b.logoUrl || '/images/watches/rolex_submariner.jpg';
  const isAct = b.isActive !== undefined ? Boolean(b.isActive) : (b.active !== undefined ? Boolean(b.active) : true);

  return {
    ...b,
    name: b.name || '',
    slug: b.slug || (b.name ? b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''),
    badge: bdg,
    tag: bdg,
    location: loc,
    established: est,
    origin: orig,
    founded: est,
    featuredCollection: feat,
    model: feat,
    description: desc,
    subtitle: desc,
    image: img,
    imageAlt: b.imageAlt || `${b.name || 'Brand'} Collection`,
    filterTarget: b.filterTarget || b.name || '',
    accentColor: b.accentColor || '#8a6709',
    color: b.color || '#0f172a',
    displayOrder: typeof b.displayOrder === 'number' ? b.displayOrder : 1,
    active: isAct,
    isActive: isAct
  };
};

export const getBrands = async (req, res) => {
  try {
    const isAll = req.query.all === 'true' || req.query.scope === 'admin' || req.query.active === 'all';
    const query = {};

    if (!isAll) {
      query.$or = [{ active: true }, { isActive: true }];
    }

    let brands = await Brand.find(query).sort({ displayOrder: 1, name: 1 }).lean();

    if (!brands || brands.length === 0) {
      // Check store.json fallback
      if (fs.existsSync(STORE_JSON_PATH)) {
        try {
          const storeData = JSON.parse(fs.readFileSync(STORE_JSON_PATH, 'utf-8'));
          if (Array.isArray(storeData.brands) && storeData.brands.length > 0) {
            brands = storeData.brands;
            if (!isAll) {
              brands = brands.filter(b => b.active !== false && b.isActive !== false);
            }
            brands.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          }
        } catch (e) {}
      }
    }

    const normalized = brands.map(normalizeBrand);

    return res.json({
      success: true,
      count: normalized.length,
      brands: normalized
    });
  } catch (err) {
    // Fallback on error
    try {
      if (fs.existsSync(STORE_JSON_PATH)) {
        const storeData = JSON.parse(fs.readFileSync(STORE_JSON_PATH, 'utf-8'));
        let brands = storeData.brands || [];
        if (req.query.all !== 'true' && req.query.scope !== 'admin') {
          brands = brands.filter(b => b.active !== false && b.isActive !== false);
        }
        brands.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        return res.json({
          success: true,
          count: brands.length,
          brands: brands.map(normalizeBrand)
        });
      }
    } catch (e) {}

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBrandBySlug = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const clean = slugOrId.toLowerCase().trim();
    const safeClean = escapeRegex(clean);

    let brand = await Brand.findOne({
      $or: [
        { slug: clean },
        { id: clean },
        { name: new RegExp(`^${safeClean}$`, 'i') }
      ]
    }).lean();

    if (!brand && fs.existsSync(STORE_JSON_PATH)) {
      try {
        const storeData = JSON.parse(fs.readFileSync(STORE_JSON_PATH, 'utf-8'));
        brand = (storeData.brands || []).find(b =>
          b.slug === clean || b.id === clean || (b.name && b.name.toLowerCase() === clean)
        );
      } catch (e) {}
    }

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    return res.json({ success: true, brand: normalizeBrand(brand) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createBrand = async (req, res) => {
  try {
    const {
      name,
      slug: customSlug,
      badge,
      tag,
      location,
      established,
      featuredCollection,
      model,
      description,
      subtitle,
      image,
      imageAlt,
      filterTarget,
      accentColor,
      color,
      displayOrder,
      isActive,
      active
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Brand name is required.' });
    }

    const cleanName = name.trim();
    const slug = customSlug
      ? customSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const id = req.body.id || `brand-${slug}`;

    // Check duplicate slug
    const existingSlug = await Brand.findOne({ $or: [{ slug }, { id }] });
    if (existingSlug) {
      return res.status(400).json({ success: false, message: `Brand with slug '${slug}' already exists.` });
    }

    const loc = location || 'Geneva, Switzerland';
    const est = established || '';
    const orig = est ? `${loc} • Est. ${est}` : loc;
    const feat = featuredCollection || model || '';
    const desc = description || subtitle || '';
    const bdg = badge || tag || 'OFFICIAL ICON';
    const img = image || '/images/watches/rolex_submariner.jpg';
    const isAct = isActive !== undefined ? Boolean(isActive) : (active !== undefined ? Boolean(active) : true);

    const newBrand = {
      id,
      name: cleanName,
      slug,
      badge: bdg,
      tag: bdg,
      location: loc,
      established: est,
      origin: orig,
      founded: est,
      featuredCollection: feat,
      model: feat,
      description: desc,
      subtitle: desc,
      image: img,
      imageAlt: imageAlt || `${cleanName} Watch Collection`,
      filterTarget: filterTarget || cleanName,
      accentColor: accentColor || '#8a6709',
      color: color || '#0f172a',
      goldAccent: '#d4af37',
      displayOrder: typeof displayOrder === 'number' ? displayOrder : (Number(displayOrder) || 1),
      active: isAct,
      isActive: isAct,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const saved = await Brand.create(newBrand);

    // Sync to store.json
    try {
      if (fs.existsSync(STORE_JSON_PATH)) {
        const storeData = JSON.parse(fs.readFileSync(STORE_JSON_PATH, 'utf-8'));
        if (!Array.isArray(storeData.brands)) storeData.brands = [];
        const idx = storeData.brands.findIndex(b => b.id === id || b.slug === slug);
        if (idx >= 0) {
          storeData.brands[idx] = { ...saved.toObject() };
        } else {
          storeData.brands.push(saved.toObject());
        }
        fs.writeFileSync(STORE_JSON_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
      }
    } catch (e) {}

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `Master Administrator catalogued brand: "${cleanName}"`,
      time: 'Just now',
      type: 'admin'
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Brand created successfully.',
      brand: normalizeBrand(saved.toObject ? saved.toObject() : saved)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await Brand.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    // Prepare synchronized updates
    const loc = updates.location !== undefined ? updates.location : (existing.location || existing.origin?.split('•')[0]?.trim());
    const est = updates.established !== undefined ? updates.established : (existing.established || existing.founded);
    const orig = est ? `${loc} • Est. ${est}` : loc;
    const bdg = updates.badge !== undefined ? updates.badge : (updates.tag !== undefined ? updates.tag : existing.badge);
    const feat = updates.featuredCollection !== undefined ? updates.featuredCollection : (updates.model !== undefined ? updates.model : existing.featuredCollection);
    const desc = updates.description !== undefined ? updates.description : (updates.subtitle !== undefined ? updates.subtitle : existing.description);
    const img = updates.image !== undefined ? updates.image : (updates.bannerUrl !== undefined ? updates.bannerUrl : existing.image);
    const isAct = updates.isActive !== undefined ? Boolean(updates.isActive) : (updates.active !== undefined ? Boolean(updates.active) : existing.active);

    const updatePayload = {
      ...updates,
      badge: bdg,
      tag: bdg,
      location: loc,
      established: est,
      origin: orig,
      founded: est,
      featuredCollection: feat,
      model: feat,
      description: desc,
      subtitle: desc,
      image: img,
      active: isAct,
      isActive: isAct,
      updatedAt: new Date()
    };

    if (updates.displayOrder !== undefined) {
      updatePayload.displayOrder = Number(updates.displayOrder);
    }

    const updated = await Brand.findOneAndUpdate(
      { _id: existing._id },
      { $set: updatePayload },
      { returnDocument: 'after' }
    ).lean();

    // Sync to store.json
    try {
      if (fs.existsSync(STORE_JSON_PATH)) {
        const storeData = JSON.parse(fs.readFileSync(STORE_JSON_PATH, 'utf-8'));
        if (Array.isArray(storeData.brands)) {
          const idx = storeData.brands.findIndex(b => b.id === existing.id || b.slug === existing.slug);
          if (idx >= 0) {
            storeData.brands[idx] = { ...updated };
            fs.writeFileSync(STORE_JSON_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
          }
        }
      }
    } catch (e) {}

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `Brand details updated for "${updated.name}"`,
      time: 'Just now',
      type: 'admin'
    }).catch(() => {});

    return res.json({
      success: true,
      message: 'Brand updated successfully.',
      brand: normalizeBrand(updated)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Brand.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    await Brand.deleteOne({ _id: existing._id });

    // Sync deletion to store.json
    try {
      if (fs.existsSync(STORE_JSON_PATH)) {
        const storeData = JSON.parse(fs.readFileSync(STORE_JSON_PATH, 'utf-8'));
        if (Array.isArray(storeData.brands)) {
          storeData.brands = storeData.brands.filter(b => b.id !== existing.id && b.slug !== existing.slug);
          fs.writeFileSync(STORE_JSON_PATH, JSON.stringify(storeData, null, 2), 'utf-8');
        }
      }
    } catch (e) {}

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `Brand "${existing.name}" removed from inventory by Master Admin`,
      time: 'Just now',
      type: 'admin'
    }).catch(() => {});

    return res.json({ success: true, message: `Brand "${existing.name}" deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
};
