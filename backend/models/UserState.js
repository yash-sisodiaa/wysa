const mongoose = require('mongoose');

const userStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  currentQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  lastCheckpointId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null }
});

module.exports = mongoose.model('UserState', userStateSchema);
