// test-api.mjs
async function testApi() {
  const url = 'http://localhost:3000/api/submit-comment';
  const data = {
    title: 'Test from test-api.mjs with Custom Title',
    comment: 'This is a test comment from a Node.js script, validating the custom title feature.'
  };

  console.log(`Sending POST request to ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`Status Code: ${response.status}`);
    
    // Check if the response has content before trying to parse it as JSON
    const text = await response.text();
    if (text) {
      try {
        const responseBody = JSON.parse(text);
        console.log('Response Body:', responseBody);
      } catch (e) {
        console.log('Response is not JSON, raw text:', text);
      }
    } else {
      console.log('Response was empty.');
    }

  } catch (error) {
    console.error('Error making request:', error);
  }
}

testApi();
