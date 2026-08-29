const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Module = require('./models/Module');
const Question = require('./models/Question');
const User = require('./models/User');
const UserState = require('./models/UserState');
const ConversationHistory = require('./models/ConversationHistory');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wysa-flow';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');


    await Module.deleteMany({});
    await Question.deleteMany({});
    await User.deleteMany({});
    await UserState.deleteMany({});
    await ConversationHistory.deleteMany({});


    const onboardingModule = new Module({ name: 'Onboarding' });
    const anxietyModule = new Module({ name: 'Anxiety Assessment' });
    const sleepModule = new Module({ name: 'Sleep Tracker' });

    await onboardingModule.save();
    await anxietyModule.save();
    await sleepModule.save();


    const q1 = new Question({ moduleId: onboardingModule._id, text: 'Hi! How are you feeling today?' });
    const q2 = new Question({ moduleId: onboardingModule._id, text: 'Glad to hear that! What would you like to focus on today?' });
    const q3 = new Question({ moduleId: onboardingModule._id, text: 'Awesome! Have a wonderful day.' });


    const a1 = new Question({ moduleId: anxietyModule._id, text: 'I understand. Let\'s talk about your anxiety. Does it happen often?', isCheckpoint: true });
    const a2 = new Question({ moduleId: anxietyModule._id, text: 'I\'m sorry to hear that it is frequent. Have you tried deep breathing exercises?' });
    const a3 = new Question({ moduleId: anxietyModule._id, text: 'Got it. When it does happen, is it usually related to work or stress?' });
    const a4 = new Question({ moduleId: anxietyModule._id, text: 'We can work on managing this together. I have noted this down for your profile.' });


    const s1 = new Question({ moduleId: sleepModule._id, text: 'Let\'s look at your sleep. How many hours of sleep did you get last night?', isCheckpoint: true });
    const s2 = new Question({ moduleId: sleepModule._id, text: 'That\'s not much! Are you having trouble falling asleep?' });
    const s3 = new Question({ moduleId: sleepModule._id, text: 'That\'s okay, but we could aim for a bit more next time.' });
    const s4 = new Question({ moduleId: sleepModule._id, text: 'Try to avoid screens an hour before bed tonight. Have a good rest!' });


    q1.options.push(
      { text: 'Great', nextQuestionId: q2._id },
      { text: 'Not so good', nextQuestionId: a1._id }
    );

    q2.options.push(
      { text: 'Sleep', nextQuestionId: s1._id },
      { text: 'Just Productivity', nextQuestionId: q3._id }
    );

    q3.options.push(
      { text: 'Finish', nextQuestionId: null }
    );


    a1.options.push(
      { text: 'Yes, daily', nextQuestionId: a2._id },
      { text: 'Only sometimes', nextQuestionId: a3._id }
    );

    a2.options.push(
      { text: 'Yes, they help', nextQuestionId: a4._id },
      { text: 'No, I have not', nextQuestionId: a4._id }
    );

    a3.options.push(
      { text: 'Yes, mostly work', nextQuestionId: a4._id },
      { text: 'No, it varies', nextQuestionId: a4._id }
    );

    a4.options.push(
      { text: 'Finish', nextQuestionId: null }
    );

    s1.options.push(
      { text: 'Less than 5 hours', nextQuestionId: s2._id },
      { text: '5 to 7 hours', nextQuestionId: s3._id },
      { text: 'More than 7 hours', nextQuestionId: s4._id }
    );

    s2.options.push(
      { text: 'Yes, my mind races', nextQuestionId: s4._id },
      { text: 'No, I just went to bed late', nextQuestionId: s4._id }
    );

    s3.options.push(
      { text: 'I agree', nextQuestionId: s4._id }
    );

    s4.options.push(
      { text: 'Finish', nextQuestionId: null }
    );

    // Save all questions
    await Promise.all([
      q1.save(), q2.save(), q3.save(),
      a1.save(), a2.save(), a3.save(), a4.save(),
      s1.save(), s2.save(), s3.save(), s4.save()
    ]);


    onboardingModule.startQuestionId = q1._id;
    anxietyModule.startQuestionId = a1._id;
    sleepModule.startQuestionId = s1._id;

    await onboardingModule.save();
    await anxietyModule.save();
    await sleepModule.save();

    console.log('Seed completed successfully with expanded flows!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
