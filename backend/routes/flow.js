const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Module = require('../models/Module');
const Question = require('../models/Question');
const UserState = require('../models/UserState');
const ConversationHistory = require('../models/ConversationHistory');


router.get(['/start', '/start/:moduleId'], auth, async (req, res) => {
  try {
    const userId = req.userId;
    let userState = await UserState.findOne({ userId });

    if (userState) {
      const question = await Question.findById(userState.currentQuestionId);
      const lastHistory = await ConversationHistory.findOne({ userId }).sort({ timestamp: -1 });
      const canGoBack = !!lastHistory && (!userState.lastCheckpointId || userState.lastCheckpointId.toString() !== lastHistory.questionId.toString());
      return res.json({ question, state: userState, canGoBack });
    }

    let module;
    if (req.params.moduleId) {
      module = await Module.findById(req.params.moduleId);
    } else {
      module = await Module.findOne();
    }

    if (!module) return res.status(404).json({ error: 'Module not found' });

    userState = new UserState({
      userId,
      currentModuleId: module._id,
      currentQuestionId: module.startQuestionId,
      lastCheckpointId: null
    });
    await userState.save();

    const question = await Question.findById(module.startQuestionId);
    res.json({ question, state: userState, canGoBack: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit answer
router.post('/answer', auth, async (req, res) => {
  try {
    const { questionId, optionId } = req.body;
    const userId = req.userId;

    const userState = await UserState.findOne({ userId });
    if (!userState) return res.status(400).json({ error: 'No active conversation found. Start one first.' });

    if (userState.currentQuestionId.toString() !== questionId) {
      return res.status(400).json({
        error: 'Invalid state flow. You are trying to answer a different question.',
        currentValidQuestionId: userState.currentQuestionId
      });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const option = question.options.id(optionId);
    if (!option) return res.status(400).json({ error: 'Invalid option' });

    await ConversationHistory.create({
      userId,
      questionId,
      selectedOptionId: optionId
    });

    const nextQuestionId = option.nextQuestionId;
    if (!nextQuestionId) {
      return res.json({ message: 'Conversation finished.', question: null });
    }

    const nextQuestion = await Question.findById(nextQuestionId);
    if (!nextQuestion) return res.status(500).json({ error: 'Next question reference is broken' });

    userState.currentQuestionId = nextQuestionId;
    userState.currentModuleId = nextQuestion.moduleId;

    if (nextQuestion.isCheckpoint) {
      userState.lastCheckpointId = nextQuestionId;
    }

    await userState.save();


    const canGoBack = !nextQuestion.isCheckpoint;

    const lastHistory = await ConversationHistory.findOne({ userId }).sort({ timestamp: -1 });
    const canGoBackCheck = !!lastHistory && (!userState.lastCheckpointId || userState.lastCheckpointId.toString() !== lastHistory.questionId.toString());

    res.json({ question: nextQuestion, state: userState, canGoBack: canGoBackCheck });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/question/:id', auth, async (req, res) => {
  try {
    const requestedQuestionId = req.params.id;
    const userId = req.userId;

    const userState = await UserState.findOne({ userId });
    if (!userState) return res.status(400).json({ error: 'No active state. Please start.' });

    if (userState.currentQuestionId.toString() === requestedQuestionId) {
      const q = await Question.findById(requestedQuestionId);
      const lastHistory = await ConversationHistory.findOne({ userId }).sort({ timestamp: -1 });
      const canGoBack = !!lastHistory && (!userState.lastCheckpointId || userState.lastCheckpointId.toString() !== lastHistory.questionId.toString());
      return res.json({ question: q, state: userState, canGoBack });
    }


    const validQuestion = await Question.findById(userState.currentQuestionId);
    const lastHistory = await ConversationHistory.findOne({ userId }).sort({ timestamp: -1 });
    const canGoBack = !!lastHistory && (!userState.lastCheckpointId || userState.lastCheckpointId.toString() !== lastHistory.questionId.toString());

    return res.json({
      warning: 'Requested question is no longer valid for your state. Redirected to current state.',
      question: validQuestion,
      state: userState,
      canGoBack
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/back', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const userState = await UserState.findOne({ userId });
    if (!userState) return res.status(400).json({ error: 'No active state.' });

    const lastHistory = await ConversationHistory.findOne({ userId }).sort({ timestamp: -1 });
    if (!lastHistory) {
      return res.status(400).json({ error: 'Cannot go back further.' });
    }

    if (userState.lastCheckpointId && userState.lastCheckpointId.toString() === lastHistory.questionId.toString()) {
      return res.status(400).json({ error: 'Cannot go back past a checkpoint.' });
    }

    const previousQuestion = await Question.findById(lastHistory.questionId);

    userState.currentQuestionId = previousQuestion._id;
    userState.currentModuleId = previousQuestion.moduleId;
    await userState.save();

    await ConversationHistory.findByIdAndDelete(lastHistory._id);

    const newLastHistory = await ConversationHistory.findOne({ userId }).sort({ timestamp: -1 });
    const canGoBack = !!newLastHistory && (!userState.lastCheckpointId || userState.lastCheckpointId.toString() !== newLastHistory.questionId.toString());

    res.json({
      question: previousQuestion,
      state: userState,
      canGoBack,
      previouslySelectedOptionId: lastHistory.selectedOptionId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
