import { Return, Order, ActivityLog } from '../models/index.js';

/**
 * Submit New Return / Exchange Request
 * POST /api/returns
 */
export const createReturn = async (req, res) => {
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
      const order = await Order.findOne({
        $or: [{ id: orderId }, { orderNumber: orderId }]
      }).lean();
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const saved = await Return.create(newReturn);

    return res.status(201).json({
      success: true,
      message: 'Return / Exchange request registered successfully.',
      request: saved,
      return: saved,
      returnRequest: saved
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get All Return & Exchange Requests (Admin)
 * GET /api/returns
 */
export const getReturns = async (req, res) => {
  try {
    const returns = await Return.find({}).sort({ createdAt: -1 }).lean();
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
export const lookupReturn = async (req, res) => {
  try {
    const rawLookup = req.params.orderOrReturnId || req.query.orderOrReturnId || req.query.id || req.query.orderId || req.query.q || '';
    if (!rawLookup || !rawLookup.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an order number, return ID, or customer email.'
      });
    }

    const clean = rawLookup.trim().toUpperCase();
    const cleanEmail = rawLookup.trim().toLowerCase();

    const found = await Return.find({
      $or: [
        { id: clean },
        { orderId: clean },
        { waybillNumber: clean },
        { customerEmail: cleanEmail }
      ]
    }).sort({ createdAt: -1 }).lean();

    if (!found.length) {
      return res.status(404).json({
        success: false,
        message: `No return record found matching "${rawLookup}".`
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
export const updateReturnStatus = async (req, res) => {
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

    const updated = await Return.findOneAndUpdate(
      { id },
      {
        $set: {
          status,
          resolutionNotes: resolutionNotes || undefined,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Return record not found.' });
    }

    // Activity log
    await ActivityLog.create({
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

export default {
  createReturn,
  getReturns,
  lookupReturn,
  updateReturnStatus
};
