import Contact from '../models/contactUs.model.js';

/**
 * Create a new contact message
 * @param {Object} data - contact request payload
 * @returns {Promise<Contact>}
 */
export const createContact = async (data) => {
  const { firstname, lastname ,phoneNo, email, subject, message } = data;

  // Validate required fields
  if (!lastname || !lastname || !phoneNo || !email || !subject || !message) {
    throw new Error('All fields are required');
  }

  // Save to DB
  const contact = new Contact({
    firstname,
    lastname,
    phoneNo,
    email,
    subject,
    message,
  });

  return await contact.save();
};
