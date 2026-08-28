import { Brand, ActivityLog } from '../models/index.js';
import { escapeRegex } from '../utils/regex.js';

export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ active: true }).sort({ displayOrder: 1, name: 1 }).lean();
    return res.json({
      success: true,
      count: brands.length,
      brands
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBrandBySlug = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const clean = slugOrId.toLowerCase().trim();
    const safeClean = escapeRegex(clean);

    const brand = await Brand.findOne({
      $or: [
        { slug: clean },
        { id: clean },
        { name: new RegExp(`^${safeClean}$`, 'i') }
      ]
    }).lean();

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    return res.json({ success: true, brand });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createBrand = async (req, res) => {
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
      createdAt: new Date()
    };

    const saved = await Brand.create(newBrand);

    await ActivityLog.create({
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

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await Brand.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    const updated = await Brand.findOneAndUpdate(
      { _id: existing._id },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    await ActivityLog.create({
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

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Brand.findOne({ $or: [{ id }, { slug: id }] });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    await Brand.deleteOne({ _id: existing._id });

    await ActivityLog.create({
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
