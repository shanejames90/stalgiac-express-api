const mongoose = require('mongoose')

const screenshotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toObject: {
    transform: (_doc, screenshot) => {
      return {
        id: screenshot._id,
        title: screenshot.title,
        description: screenshot.description,
        location: screenshot.location
      }
    }
  }
})

module.exports = mongoose.model('Screenshot', screenshotSchema)
