import { Cart, Product } from '../models/index.js';

/**
 * Get Customer Cart
 * GET /api/cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.email;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Refresh prices strictly from current Product collection
    let subtotal = 0;
    const validatedItems = [];

    for (const item of cart.items || []) {
      const product = await Product.findOne({
        $or: [{ id: item.productId }, { sku: item.productId }, { slug: item.productId }]
      }).lean();

      if (product && product.active !== false) {
        const itemTotal = product.price * (item.quantity || 1);
        subtotal += itemTotal;
        validatedItems.push({
          productId: product.id,
          name: product.name,
          brand: product.brand,
          sku: product.sku,
          price: product.price,
          comparePrice: product.comparePrice,
          image: product.images?.[0] || item.image || '',
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedStrap: item.selectedStrap,
          stock: product.stock
        });
      }
    }

    return res.json({
      success: true,
      cart: {
        userId,
        items: validatedItems,
        subtotal,
        count: validatedItems.reduce((sum, it) => sum + it.quantity, 0)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Add Item to Cart
 * POST /api/cart
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.email;
    const { productId, quantity = 1, selectedColor, selectedStrap } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const product = await Product.findOne({
      $or: [{ id: productId }, { sku: productId }, { slug: productId }]
    }).lean();

    if (!product || product.active === false) {
      return res.status(404).json({ success: false, message: 'Timepiece is unavailable.' });
    }

    const itemQty = Math.max(1, Number(quantity) || 1);
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      it => it.productId === product.id && it.selectedColor === selectedColor && it.selectedStrap === selectedStrap
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += itemQty;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        image: product.images?.[0] || '',
        quantity: itemQty,
        selectedColor,
        selectedStrap,
        addedAt: new Date()
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    return res.json({
      success: true,
      message: `"${product.name}" added to cart.`,
      cart
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update Cart Item Quantity
 * PUT /api/cart/:productId
 */
export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.email;
    const { productId } = req.params;
    const { quantity, delta } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const itemIndex = cart.items.findIndex(it => it.productId === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }

    if (quantity !== undefined) {
      const newQty = Number(quantity);
      if (newQty <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = newQty;
      }
    } else if (delta !== undefined) {
      const newQty = cart.items[itemIndex].quantity + Number(delta);
      if (newQty <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = newQty;
      }
    }

    cart.updatedAt = new Date();
    await cart.save();

    return res.json({
      success: true,
      message: 'Cart updated.',
      cart
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Remove Item from Cart
 * DELETE /api/cart/:productId
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.email;
    const { productId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      {
        $pull: { items: { productId } },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return res.json({
      success: true,
      message: 'Item removed from cart.',
      cart: cart || { userId, items: [] }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Clear Cart
 * DELETE /api/cart
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.email;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [], updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return res.json({
      success: true,
      message: 'Cart cleared.',
      cart: cart || { userId, items: [] }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
};
