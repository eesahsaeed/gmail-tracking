
const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
  name: String,
  recipients: [{
    name: String,
    email: String,
    sent: {
      type: Boolean,
      default: false
    },
    opened: {
      type: Boolean,
      default: false
    },
    clicked: {
      type: Boolean,
      default: false
    }
  }],
  emailBody: String
});

const Campaign = mongoose.model("Campaign", CampaignSchema);

module.exports = Campaign;
