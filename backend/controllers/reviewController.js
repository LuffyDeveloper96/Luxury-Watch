import { db } from '../config/db.js';

export const getReviews = (req, res) => {
  try {
    let reviews = db.getCollection('reviews');
    const { productId } = req.query;

    if (productId) {
      reviews = reviews.filter(r => r.productId === productId);
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
    const { productId, userName, rating, title, comment, location } = req.body;

    if (!productId || !userName || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, reviewer name, and comment are required.'
      });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      productId,
      userName,
      rating: Number(rating) || 5,
      date: new Date().toISOString().split('T')[0],
      title: title || 'Exquisite Horological Timepiece',
      comment,
      verified: true,
      location: location || 'Mayfair, London'
    };

    const saved = db.insert('reviews', newReview);

    // Update product rating and reviewsCount in catalog
    const prod = db.findById('products', productId);
    if (prod) {
      const allProductReviews = db.getCollection('reviews').filter(r => r.productId === productId);
      const avgRating = allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length;
      db.update('products', productId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: allProductReviews.length
      });
    }

    // Log Activity
    db.insert('activityLog', {
      id: `act-${Date.now()}`,
      text: `5-star collector review submitted by ${userName} (${location || 'London'})`,
      time: 'Just now',
      type: 'review'
    });

    return res.status(201).json({
      success: true,
      message: 'Review published successfully.',
      review: saved
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
