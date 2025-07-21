// backend/models/User.js

const mongoose = require("mongoose");

// Sub-schema: Authentication
const AuthenticationSchema = new mongoose.Schema(
  {
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Don't include in queries by default
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
  },
  { _id: false }
); // Prevent creating separate _id for sub-doc

// Sub-schema: Settings
const SettingsSchema = new mongoose.Schema(
  {
    emailNotifications: {
      isEnabled: { type: Boolean, default: true },
      fines: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
    },
  },
  { _id: false }
);

// Sub-schema: Metadata
const MetadataSchema = new mongoose.Schema(
  {
    studentID: { type: String, trim: true },
    notes: { type: String },
    goodDeeds: [{ type: String }],
    accomplishments: [{ type: String }], // Array of strings
    socialMedia: {
      instagram: String,
      twitter: String,
      linkedin: String,
      facebook: String,
    },
    interests: [String],
    skills: [String],
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: false }
);

// Main User Schema
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minLenght: [2, "First name cannot be less than 2 characters"],
      maxLength: [50, "First name cannot be exceed 50 characters"],
      match: [
        /^[\p{L}\p{M} '-]+$/u,
        "Name can only contain letters, spaces, hyphens, and apostrophes",
      ],
    },
    middleName: {
      type: String,
      trim: true,
      maxLength: [50, "Middle name cannot be exceed 50 characters"],
      match: [
        /^[\p{L}\p{M} '-]+$/u,
        "Name can only contain letters, spaces, hyphens, and apostrophes",
      ],
    },
    lastName: {
      type: String,
      required: [true, "Last is required"],
      trim: true,
      minLenght: [2, "Last name cannot be less than 2 characters"],
      maxLength: [50, "Last name cannot be exceed 50 characters"],
      match: [
        /^[\p{L}\p{M} '-]+$/u,
        "Name can only contain letters, spaces, hyphens, and apostrophes",
      ],
    },
    email: {
      type: String,
      required: true,
      // unique: true, // uniqueness is added later in the indexes and uniqueness section
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return value < new Date();
        },
        message: "Date of birth must be in the past",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "suspended", "pending", "alumni"],
        message:
          "Status must be one of: active, inactive, suspended, pending, alumni",
      },
      default: "pending",
    },
    positions: {
      type: [String],
      enum: {
        values: [
          "President",
          "Vice President",
          "Secretary",
          "Treasurer",
          "Public Relations",
          "Dessalines",
          "Community Service",
          "Brother-to-Brother Coordinator",
          "Historian",
          "White Noise Coordinator",
          "Mission Trip Coordinator",
          "Member",
        ],
        message: "Invalid position",
      },
      default: ["Member"],
      validate: {
        validator: function (value) {
          const required = "Member";
          const unique = new Set(value).size === value.length;
          return value.includes(required) && unique;
        },
        message:
          'At least one position must be "Member", and all positions must be unique.',
      },
    },
    groups: {
      type: [String],
      enum: {
        values: ["Admin", "PR", "Marketing", "Finance", "Member"],
        message: "Invalid group value",
      },
      default: ["Member"],
      validate: {
        validator: function (value) {
          const required = "Member";
          const unique = new Set(value).size === value.length;
          return value.includes(required) && unique;
        },
        message: 'Groups must include "Member" and contain only unique values.',
      },
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // refers to another user document
    },

    mentees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // refers to another user document
      },
    ],
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    balance: {
      type: Number,
      default: 0.0,
      get: function (value) {
        return Math.round(value * 100) / 100; // Round to 2 decimal places
      },
      set: function (value) {
        return Math.round(value * 100) / 100;
      },
    },
    totalDonation: {
      type: Number,
      default: 0.0,
      min: [0, "Total donation cannot be negative"],
      get: function (value) {
        return Math.round(value * 100) / 100;
      },
      set: function (value) {
        return Math.round(value * 100) / 100;
      },
    },
    authentication: AuthenticationSchema,
    settings: SettingsSchema,
    metadata: MetadataSchema,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
    toJSON: { getters: true, virtuals: true }, // Enable getters and virtuals on conversion to JSON
    toObject: { getters: true, virtuals: true }, // Enable getters and virtuals on conversion to Object
  }
);

// Indexes for performance and uniqueness
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ group: 1 });
UserSchema.index({ position: 1 });
UserSchema.index({ balance: 1 });

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  const middle = this.middleName ? ` ${this.middleName} ` : ` `;
  return `${this.firstName}${middle}${this.lastName}`;
});

// Virtual for account locked status
UserSchema.virtual("isLocked").get(function () {
  return !!(
    this.authentication.lockUntil && this.authentication.lockUntil > Date.now()
  );
});

// Virtual for balance status
UserSchema.virtual("balanceStatus").get(function () {
  if (this.balance > 0) return "credit";
  if (this.balance < 0) return "debt";
  return "clear";
});

// Export model
const User = mongoose.model("User", UserSchema);
module.exports = User;
