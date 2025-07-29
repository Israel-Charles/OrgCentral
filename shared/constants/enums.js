// /shared/constants/enums.js

// Enum values for User schema and validation
const UserEnums = {
  statuses: ["Active", "Inactive", "Suspended", "Pending", "Alumni"],
  positions: [
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
  groups: ["Admin", "PR", "Marketing", "Finance", "Member"],
};

module.exports = UserEnums;
