import { db } from '../config/db.js';

export const getReviews = (req, res) => {
  try {
    let reviews = db.getCollection('reviews');
    const { productId, status } = req.query;

    if (productId) {
      reviews = reviews.filter(r => r.productId === productId);
    }
    if (status) {
      reviews = reviews.filter(r => r.status === status);
    }

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createReview = (req, res) => {
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
      createdAt: new Date().toISOString()
    };

    const saved = db.insert('reviews', newReview);

    // Recalculate Product average rating
    const allProductReviews = db.getCollection('reviews').filter(r => r.productId === productId && r.status !== 'hidden');
    if (allProductReviews.length > 0) {
      const avgRating = allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length;
      db.update('products', productId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: allProductReviews.length
      });
    }

    db.insert('activityLog', {
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

export const updateReviewStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = db.findById('reviews', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const updated = db.update('reviews', id, { status });
    return res.json({ success: true, message: 'Review status updated.', review: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteReview = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.findById('reviews', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    db.delete('reviews', id);
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
