import { db } from '../config/db.js';

export const getBrands = (req, res) => {
  try {
    const brands = db.getCollection('brands');
    const sorted = [...brands].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return res.json({
      success: true,
      count: sorted.length,
      brands: sorted
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBrandBySlug = (req, res) => {
  try {
    const { slugOrId } = req.params;
    const clean = slugOrId.toLowerCase().trim();
    const brands = db.getCollection('brands');
    const brand = brands.find(b => b.slug === clean || b.id === clean || b.name.toLowerCase() === clean);

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    return res.json({ success: true, brand });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createBrand = (req, res) => {
  try {
    const { name, tagline, origin, founded, hallmark, logoUrl, bannerUrl, color, isFeatured, displayOrder } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Brand name is required.' });
    }

    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = req.body.id || `brand-${slug}`;

    const newBrand = {
      id,
      name,
      slug,
      tagline: tagline || '',
      origin: origin || 'Switzerland',
      founded: founded || '',
      hallmark: hallmark || '',
      logoUrl: logoUrl || '',
      bannerUrl: bannerUrl || '',
      color: color || '#0f172a',
      goldAccent: '#d4af37',
      isFeatured: isFeatured !== undefined ? isFeatured : true,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : Date.now(),
      active: true,
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('brands', newBrand);

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Master Administrator added luxury brand: "${name}"`,
      time: 'Just now',
      type: 'admin'
    });

    return res.status(201).json({ success: true, message: 'Brand created successfully.', brand: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBrand = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = db.findById('brands', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    const updated = db.update('brands', id, updates);

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Brand details updated for "${updated.name}"`,
      time: 'Just now',
      type: 'admin'
    });

    return res.json({ success: true, message: 'Brand updated successfully.', brand: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBrand = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findById('brands', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    db.delete('brands', id);

    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `Brand "${existing.name}" removed by Master Admin`,
      time: 'Just now',
      type: 'admin'
    });

    return res.json({ success: true, message: 'Brand removed successfully.' });
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
