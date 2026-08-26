import mongoose from 'mongoose';

const homepageContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'homepage_cms' },
  announcementBar: {
    text: { type: String, default: 'FREE SHIPPING ABOVE ₹999 | SECURE PAYMENTS | EASY RETURNS' },
    active: { type: Boolean, default: true },
    link: { type: String, default: '/shop' }
  },
  hero: {
    heading: { type: String, default: 'TIMELESS STYLE.\nPERFECTLY PRICED.' },
    subheading: { type: String, default: 'Discover authentic branded watches crafted for every occasion.' },
    badgeText: { type: String, default: 'THE 2026 HOROLOGY COLLECTION • GENEVA & LONDON' },
    ctaPrimaryText: { type: String, default: 'SHOP ALL WATCHES' },
    ctaPrimaryLink: { type: String, default: '/shop' },
    ctaSecondaryText: { type: String, default: 'EXPLORE SKELETONS' },
    ctaSecondaryLink: { type: String, default: '/shop?category=Skeletons' },
    heroImageUrl: { type: String, default: '' },
    active: { type: Boolean, default: true }
  },
  featuredCollections: [{
    title: { type: String },
    subtitle: { type: String },
    imageUrl: { type: String },
    link: { type: String }
  }],
  promotionalBanners: [{
    title: { type: String },
    discountText: { type: String },
    link: { type: String },
    active: { type: Boolean, default: true }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export const HomepageContent = mongoose.models.HomepageContent || mongoose.model('HomepageContent', homepageContentSchema);
export default HomepageContent;
