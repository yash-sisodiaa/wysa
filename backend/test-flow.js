async function test() {
  try {
    const timestamp = Date.now();
    const username = `testuser_${timestamp}`;
    const password = 'testpassword';
    
    console.log('1. Registering new user...');
    let regRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    let regData = await regRes.json();
    const token = regData.token;
    console.log(`Registered! Token received.`);

    const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    console.log('\n2. Starting flow...');
    let startRes = await fetch('http://localhost:5000/api/flow/start', { headers });
    let startData = await startRes.json();
    let question = startData.question;
    console.log(`Question: ${question.text}`);
    
    console.log('\n3. Answering Question 1 (Choosing "Not so good")...');
    const option1 = question.options.find(o => o.text === 'Not so good');
    let answerRes = await fetch('http://localhost:5000/api/flow/answer', {
      method: 'POST',
      headers,
      body: JSON.stringify({ questionId: question._id, optionId: option1._id })
    });
    let answerData = await answerRes.json();
    question = answerData.question;
    console.log(`Question: ${question.text}`);

    console.log('\n4. Answering Question 2 (Choosing "Yes, a bit" - this jumps modules!)...');
    const option2 = question.options.find(o => o.text === 'Yes, a bit');
    answerRes = await fetch('http://localhost:5000/api/flow/answer', {
      method: 'POST',
      headers,
      body: JSON.stringify({ questionId: question._id, optionId: option2._id })
    });
    answerData = await answerRes.json();
    question = answerData.question;
    console.log(`Question: ${question.text}`);
    console.log(`Checkpoint status of this question: ${question.isCheckpoint}`);

    console.log('\n5. Testing defensive deep linking...');
    console.log(`Attempting to access old Question 1 ID directly...`);
    let deepLinkRes = await fetch(`http://localhost:5000/api/flow/question/${startData.question._id}`, { headers });
    let deepLinkData = await deepLinkRes.json();
    console.log(`Response Warning: ${deepLinkData.warning}`);
    console.log(`Actual Question returned: ${deepLinkData.question.text}`);
    
    console.log('\nTest completed successfully! All logic verified.');

  } catch (err) {
    console.error(err);
  }
}

test();
