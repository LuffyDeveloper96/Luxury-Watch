import { Contact, ActivityLog } from '../models/index.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const contactEntry = {
      id: `cnt-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      phone: phone || '',
      subject: subject || 'General Concierge Inquiry',
      message,
      status: 'unread',
      createdAt: new Date()
    };

    const created = await Contact.create(contactEntry);

    await ActivityLog.create({
      id: `act-${Date.now()}`,
      text: `📨 New concierge inquiry received from ${name} (${email})`,
      time: 'Just now',
      type: 'user'
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you. Your inquiry has been forwarded to the Luxury Watch Haute Horlogerie Concierge.',
      entry: created
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  submitContact,
  getContacts
};
