import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  password: Joi.string().required(),
  // parent_id: Joi.string().allow('', null),
  city: Joi.string().min(2).required(),

  // visitorId: Joi.string().optional(),
  // walletAmount: Joi.number().optional(),
});


export const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
      messageCode: 'VALIDATION_ERROR',
      data: null,
    });
  }
  next();
};
