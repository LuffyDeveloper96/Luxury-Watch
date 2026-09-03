import { Review, Product, ActivityLog } from '../models/index.js';

export const getReviews = async (req, res) => {
  try {
    const { productId, status } = req.query;
    const query = {};

    if (productId) {
      query.productId = productId;
    }
    if (status) {
      query.status = status;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const storePath = path.resolve(process.cwd(), 'backend/data/store.json');
      if (fs.existsSync(storePath)) {
        const storeData = JSON.parse(fs.readFileSync(storePath, 'utf8'));
        let storeReviews = storeData.reviews || [];
        if (req.query.productId) {
          storeReviews = storeReviews.filter(r => r.productId === req.query.productId);
        }
        return res.json({
          success: true,
          count: storeReviews.length,
          reviews: storeReviews
        });
      }
    } catch (fallbackErr) {}
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, author, userName, rating, title, comment, location } = req.body;
    const reviewerName = author || userName;

    if (!productId || !reviewerName || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, author, and comment are required.'
      });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      productId,
      author: reviewerName,
      userName: reviewerName,
      rating: Number(rating) || 5,
      date: 'Just now',
      title: title || 'Exceptional Horology Craftsmanship',
      comment,
      verified: true,
      avatar: reviewerName.slice(0, 2).toUpperCase(),
      location: location || 'Geneva / India',
      status: 'approved',
      createdAt: new Date()
    };

    const saved = await Review.create(newReview);

    // Recalculate Product average rating atomically
    const allProductReviews = await Review.find({ productId, status: { $ne: 'hidden' } }).lean();
    if (allProductReviews.length > 0) {
      const avgRating = allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length;
      await Product.findOneAndUpdate(
        { $or: [{ id: productId }, { slug: productId }] },
        {
          $set: {
            rating: Math.round(avgRating * 10) / 10,
            reviewsCount: allProductReviews.length,
            updatedAt: new Date()
          }
        }
      );
    }

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `⭐️ Review posted by ${reviewerName} (${newReview.rating}★)`,
      time: 'Just now',
      type: 'review'
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted and authenticated.',
      review: saved
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await Review.findOne({ id });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const updated = await Review.findOneAndUpdate(
      { _id: existing._id },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return res.json({ success: true, message: 'Review status updated.', review: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Review.findOne({ id });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    await Review.deleteOne({ _id: existing._id });
    return res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getReviews,
  createReview,
  updateReviewStatus,
  deleteReview
};
