import { createContact } from '../services/contact.service.js';

export const submitContact = async (req, res) => {
  try {
    const contact = await createContact(req.body);

    return res.status(201).json({
      status: true,
      message: 'Contact request submitted successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Contact Us Error:', error.message);
    return res.status(400).json({
      status: false,
      message: error.message || 'Failed to submit contact request',
    });
  }
};
