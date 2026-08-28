import { HomepageContent, ActivityLog } from '../models/index.js';

const DEFAULT_HOMEPAGE = {
  key: 'homepage_cms',
  announcementBar: {
    text: 'FREE SHIPPING ABOVE ₹999 | SECURE PAYMENTS | EASY RETURNS',
    active: true,
    link: '/shop'
  },
  hero: {
    heading: 'TIMELESS STYLE.\nPERFECTLY PRICED.',
    subheading: 'Discover authentic branded watches crafted for every occasion.',
    badgeText: 'THE 2026 HOROLOGY COLLECTION • GENEVA & LONDON',
    ctaPrimaryText: 'SHOP ALL WATCHES',
    ctaPrimaryLink: '/shop',
    ctaSecondaryText: 'EXPLORE SKELETONS',
    ctaSecondaryLink: '/shop?category=Skeletons',
    heroImageUrl: '',
    active: true
  },
  featuredCollections: [
    { title: "Men's Grand Complications", subtitle: 'Master chronometers & tourbillons', link: '/shop?gender=Men' },
    { title: "Women's Diamond Editions", subtitle: 'Elegance adorned in mother-of-pearl', link: '/shop?gender=Women' },
    { title: 'Skeleton Automatics', subtitle: 'Open-worked sapphire architecture', link: '/shop?category=Skeletons' }
  ],
  promotionalBanners: [
    { title: 'Complimentary Bespoke Engraving', discountText: 'Included with every allocation', link: '/shop', active: true }
  ]
};

export const getHomepageContent = async (req, res) => {
  try {
    const doc = await HomepageContent.findOne({ key: 'homepage_cms' }).lean();
    const content = doc || DEFAULT_HOMEPAGE;
    return res.json({ success: true, content });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateHomepageContent = async (req, res) => {
  try {
    const updated = await HomepageContent.findOneAndUpdate(
      { key: 'homepage_cms' },
      {
        $set: {
          ...req.body,
          key: 'homepage_cms',
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `Master Administrator updated Homepage CMS content`,
      time: 'Just now',
      type: 'admin'
    });

    return res.json({
      success: true,
      message: 'Homepage CMS content updated successfully.',
      content: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getHomepageContent,
  updateHomepageContent
};
