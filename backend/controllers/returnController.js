import { db } from '../config/db.js';

/**
 * Submit New Return / Exchange Request
 * POST /api/returns
 */
export const createReturn = (req, res) => {
  try {
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      resolutionType = 'Refund',
      exchangeModelPreference,
      pickupAddress,
      notes
    } = req.body;

    const returnReason = req.body.returnReason || req.body.reason || 'General Return / Size Adjustment';
    let items = req.body.items;

    if (!orderId || !customerEmail || !returnReason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, customer email, and return reason are required.'
      });
    }

    if (!items || !items.length) {
      const order = db.findById('orders', orderId);
      items = order?.items || [{ name: 'Horology Timepiece Consignment', quantity: 1 }];
    }

    const returnId = `RET-LW-${Math.floor(10000 + Math.random() * 90000)}`;
    const returnWaybill = `LW-RET-IND-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newReturn = {
      id: returnId,
      orderId: orderId.trim().toUpperCase(),
      customerName: customerName || 'Valued Patron',
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone || '',
      items,
      returnReason,
      resolutionType,
      exchangeModelPreference: exchangeModelPreference || null,
      pickupAddress: pickupAddress || 'Client Registered Address',
      notes: notes || '',
      status: 'Requested',
      waybillNumber: returnWaybill,
      courierTier: 'Securitas Armoured Return Transit (Insured)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.insert('returns', newReturn);

    return res.status(201).json({
      success: true,
      message: 'Return / Exchange request registered successfully.',
      request: newReturn,
      return: newReturn,
      returnRequest: newReturn
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get All Return & Exchange Requests (Admin)
 * GET /api/returns
 */
export const getReturns = (req, res) => {
  try {
    const returns = db.getCollection('returns') || [];
    return res.json({
      success: true,
      count: returns.length,
      returns
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Look up Return Status (Customer / Public)
 * GET /api/returns/lookup/:orderOrReturnId
 */
export const lookupReturn = (req, res) => {
  try {
    const { orderOrReturnId } = req.params;
    const clean = orderOrReturnId.trim().toUpperCase();

    const returns = db.getCollection('returns') || [];
    const found = returns.filter(
      r => r.id.toUpperCase() === clean ||
           r.orderId.toUpperCase() === clean ||
           r.waybillNumber?.toUpperCase() === clean ||
           r.customerEmail?.toLowerCase() === orderOrReturnId.trim().toLowerCase()
    );

    if (!found.length) {
      return res.status(404).json({
        success: false,
        message: `No return record found matching "${orderOrReturnId}".`
      });
    }

    return res.json({
      success: true,
      returns: found
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update Return Request Status (Admin)
 * PATCH /api/returns/:id/status
 */
export const updateReturnStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const allowed = ['Requested', 'Pickup Scheduled', 'Inspected & Approved', 'Refund Issued', 'Exchange Dispatched', 'Rejected', 'Closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`
      });
    }

    const updated = db.updateById('returns', id, {
      status,
      resolutionNotes: resolutionNotes || undefined,
      updatedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Return record not found.' });
    }

    // Activity log
    db.insert('activities', {
      id: `act-${Date.now()}`,
      text: `Return #${id} updated to status: "${status}"`,
      time: 'Just now',
      location: 'Atelier Inspection Unit',
      type: 'return',
      badge: status
    });

    return res.json({
      success: true,
      message: `Return #${id} status updated to "${status}".`,
      returnRequest: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
