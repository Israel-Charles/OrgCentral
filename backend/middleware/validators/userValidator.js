// /backend/middleware/validators/userValidators.js

const Joi = require("joi");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const UserEnums = require("../../../shared/constants/enums");

// Format names with apostrophes, hyphens, etc.
const formatName = (name) => {
  if (!name || typeof name !== "string") return name;

  // Finds every word in the string and apply the function
  return name.trim().replace(/\b\w+/g, (word) => {
    if (word.includes("'")) {
      return word
        .split("'")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("'");
    }
    if (word.includes("-")) {
      return word
        .split("-")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-");
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

// Extend Joi for phone number validation
const customJoi = Joi.extend((joi) => ({
  type: "phoneNumber",
  base: joi.string(),
  messages: {
    "phoneNumber.invalid": "Please provide a valid phone number.",
  },
  validate(value, helpers) {
    if (!value || value.trim() === "") return { value: "" };

    const phone = parsePhoneNumberFromString(value, "US");
    if (!phone || !phone.isValid()) {
      return { value, errors: helpers.error("phoneNumber.invalid") };
    }
    return { value: phone.format("E.164") };
  },
}));

// Base schema for creation
const baseUserSchema = {
  firstName: customJoi
    .string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[\p{L}\p{M} '-]+$/u)
    .custom((value) => formatName(value))
    .messages({
      "string.pattern.base":
        "First name may only contain letters, spaces, hyphens, and apostrophes.",
    }),

  middleName: customJoi
    .string()
    .trim()
    .max(50)
    .pattern(/^[\p{L}\p{M} '-]+$/u)
    .allow(null, "")
    .custom((value) => (value ? formatName(value) : value)),

  lastName: customJoi
    .string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[\p{L}\p{M} '-]+$/u)
    .custom((value) => formatName(value))
    .messages({
      "string.pattern.base":
        "Last name may only contain letters, spaces, hyphens, and apostrophes.",
    }),

  email: customJoi.string().email().lowercase(),

  phoneNumber: customJoi.phoneNumber().trim().allow(null, ""),

  dateOfBirth: customJoi.date().less("now").messages({
    "date.less": "Date of birth must be in the past.",
  }),

  status: customJoi
    .string()
    .valid(...UserEnums.statuses)
    .default("Pending"),

  positions: customJoi
    .array()
    .items(customJoi.string().valid(...UserEnums.positions))
    .min(1)
    .unique()
    .default(["Member"])
    .custom((value) => {
      if (!value || value.length === 0) return ["Member"];
      return value.includes("Member") ? value : [...value, "Member"];
    }),

  groups: customJoi
    .array()
    .items(customJoi.string().valid(...UserEnums.groups))
    .min(1)
    .unique()
    .default(["Member"])
    .custom((value) => {
      if (!value || value.length === 0) return ["Member"];
      return value.includes("Member") ? value : [...value, "Member"];
    }),

  mentor: customJoi.string().hex().length(24).allow(null),
  mentees: customJoi.array().items(customJoi.string().hex().length(24)),

  balance: customJoi.number().precision(2).default(0),
  totalDonation: customJoi.number().min(0).precision(2).default(0),

  authentication: customJoi.object({
    passwordHash: customJoi.string(),
    emailVerified: customJoi.boolean().default(false),
    emailVerificationCode: customJoi.string().allow(null),
    emailVerificationExpires: customJoi.date().allow(null),
    lockUntil: customJoi.date().allow(null),
  }),

  settings: customJoi.object({
    emailNotifications: customJoi.object({
      isEnabled: customJoi.boolean().default(true),
      fines: customJoi.boolean().default(true),
      payments: customJoi.boolean().default(true),
    }),
  }),

  metadata: customJoi.object({
    studentID: customJoi.string().trim().allow(null, ""),
    notes: customJoi.string().allow(null, ""),
    goodDeeds: customJoi.array().items(customJoi.string()).default([]),
    accomplishments: customJoi.array().items(customJoi.string()).default([]),
    socialMedia: customJoi
      .array()
      .items(
        customJoi.object({
          platform: customJoi.string().trim(),
          url: customJoi.string().trim(),
        })
      )
      .default([]),
    interests: customJoi.array().items(customJoi.string()).default([]),
    skills: customJoi.array().items(customJoi.string()).default([]),
  }),
};

// Creation schema: required fields
const userCreationSchema = customJoi.object({
  ...baseUserSchema,
  firstName: baseUserSchema.firstName.required(),
  lastName: baseUserSchema.lastName.required(),
  email: baseUserSchema.email.required(),
  authentication: baseUserSchema.authentication.keys({
    passwordHash: customJoi.string().required(),
  }),
});

// Update schema: all optional
const userUpdateSchema = customJoi
  .object(baseUserSchema)
  .fork(Object.keys(baseUserSchema), (field) => field.optional());

// Middleware: validateUserCreation
const validateUserCreation = (req, res, next) => {
  const { error, value } = userCreationSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((err) => err.message),
    });
  }

  req.body = value;
  next();
};

// Middleware: validateUserUpdate
const validateUserUpdate = (req, res, next) => {
  const { error, value } = userUpdateSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
    noDefaults: true, // Prevents applying default values to updates
  });

  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((err) => err.message),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateUserCreation,
  validateUserUpdate,
};
