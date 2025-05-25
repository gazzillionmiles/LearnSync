
import { evaluatePromptWithGroq } from './services/groqService';

async function testGroqAPI() {
  try {
    console.log('Testing Groq API evaluation function...');
    const evaluation = await evaluatePromptWithGroq(
      'Write a poem about the ocean that has exactly 4 lines and mentions seagulls.',
      'Craft a zero-shot prompt that asks the AI to generate a short poem about technology.',
      'Write a poem about the ocean that has exactly 4 lines and mentions seagulls.',
      'Generate a poem about technology with exactly 4 verses. Include at least one metaphor comparing technology to nature. End with a thought-provoking question about the future.'
    );
    
    console.log('✅ Groq API test successful!');
    console.log('Evaluation result:', JSON.stringify(evaluation, null, 2));
  } catch (error: any) {
    console.error('❌ Groq API test failed:', error.message || 'Unknown error');
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  console.log('Starting Groq API test...');
  testGroqAPI()
    .then(() => console.log('Test complete.'))
    .catch(err => console.error('Unhandled error during test:', err));
}
