import Contact from '../models/contactUs.model.js';

/**
 * Create a new contact message
 * @param {Object} data - contact request payload
 * @returns {Promise<Contact>}
 */
export const createContact = async (data) => {
  const { name, email, subject, message } = data;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    throw new Error('All fields are required');
  }

  // Save to DB
  const contact = new Contact({
    name,
    email,
    subject,
    message,
  });

  return await contact.save();
};
