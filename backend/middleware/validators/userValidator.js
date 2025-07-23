// /backend/middleware/validators/userValidators.js

const Joi = require("joi");
const UserEnums = require("../../../shared/constants/enums");

const userSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[\p{L}\p{M} '-]+$/u)
    .required()
    .messages({
      "string.pattern.base":
        "First name may only contain letters, spaces, hyphens, and apostrophes.",
    }),

  middleName: Joi.string()
    .trim()
    .max(50)
    .pattern(/^[\p{L}\p{M} '-]+$/u)
    .allow(null, ""),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[\p{L}\p{M} '-]+$/u)
    .required()
    .messages({
      "string.pattern.base":
        "Last name may only contain letters, spaces, hyphens, and apostrophes.",
    }),

  email: Joi.string().email().lowercase().required(),

  phoneNumber: Joi.string().trim().allow(null, ""), // Optional

  dateOfBirth: Joi.date().less("now").messages({
    "date.less": "Date of birth must be in the past.",
  }),

  status: Joi.string()
    .valid(...UserEnums.statuses)
    .default("pending"),

  positions: Joi.array()
    .items(Joi.string().valid(...UserEnums.positions))
    .min(1)
    .unique()
    .default(["Member"])
    .messages({
      "any.only": "Invalid position provided.",
    }),

  groups: Joi.array()
    .items(Joi.string().valid(...UserEnums.groups))
    .min(1)
    .unique()
    .default(["Member"]),

  mentor: Joi.string().hex().length(24).allow(null),
  mentees: Joi.array().items(Joi.string().hex().length(24)),

  balance: Joi.number().precision(2).default(0),
  totalDonation: Joi.number().min(0).precision(2).default(0),

  authentication: Joi.object({
    passwordHash: Joi.string().required(),
    emailVerified: Joi.boolean().default(false),
    emailVerificationCode: Joi.string().allow(null),
    emailVerificationExpires: Joi.date().allow(null),
    lockUntil: Joi.date().allow(null),
  }),

  settings: Joi.object({
    emailNotifications: Joi.object({
      isEnabled: Joi.boolean().default(true),
      fines: Joi.boolean().default(true),
      payments: Joi.boolean().default(true),
    }),
  }),

  metadata: Joi.object({
    studentID: Joi.string().trim().allow(null, ""),
    notes: Joi.string().allow(null, ""),
    goodDeeds: Joi.array().items(Joi.string()).default([]),
    accomplishments: Joi.array().items(Joi.string()).default([]),
    socialMedia: Joi.object({
      instagram: Joi.string().uri().allow(null, ""),
      twitter: Joi.string().uri().allow(null, ""),
      linkedin: Joi.string().uri().allow(null, ""),
      facebook: Joi.string().uri().allow(null, ""),
    }),
    interests: Joi.array().items(Joi.string()).default([]),
    skills: Joi.array().items(Joi.string()).default([]),
    customFields: Joi.object().pattern(Joi.string(), Joi.any()),
  }),
});

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((err) => err.message),
    });
  }
  next();
};

module.exports = validateUser;
