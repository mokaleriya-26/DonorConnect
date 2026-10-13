import { updateUserProfile } from '../services/user.service.js';

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await updateUserProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      user: updated,
      message: 'Profile updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};
