const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
});

module.exports = mongoose.model('Module', moduleSchema);
