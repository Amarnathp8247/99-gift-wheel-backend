import { v4 as uuidv4 } from 'uuid';
import AnonymousUser from '../models/anonymousUser.model.js';


export async function createAnonymousUser(req, res) {
  try {
    const { visitorId } = req.body;

    if (!visitorId) {
      return res.status(400).json({
        status: false,
        message: 'visitorId is required',
      });
    }

    // Check if visitorId already exists
    const existingUser = await AnonymousUser.findOne({ visitorId });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: 'Visitor ID already exists. Please try again.',
      });
    }

    // If not, create new anonymous user
    const user = new AnonymousUser({ visitorId });
    await user.save();

    return res.status(201).json({
      status: true,
      visitorId,
      message: 'Visitor ID registered successfully.',
    });

  } catch (err) {
    console.error('Error creating anonymous user:', err);
    return res.status(500).json({
      status: false,
      message: 'Failed to create anonymous user',
    });
  }
}

