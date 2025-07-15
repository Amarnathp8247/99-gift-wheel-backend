import { v4 as uuidv4 } from 'uuid';
import AnonymousUser from '../models/anonymousUser.model.js';

export async function createAnonymousUser(req, res) {
  try {
    const visitorId = uuidv4();

    const user = new AnonymousUser({ visitorId });
    await user.save();

    res.status(201).json({
      status: true,
      visitorId,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Failed to create anonymous user',
    });
  }
}
