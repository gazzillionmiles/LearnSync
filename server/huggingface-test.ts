import axios from 'axios';
import { evaluatePromptWithAI } from './services/huggingfaceService';

async function testHuggingFaceAPI() {
  // First, test a direct API call to see if we can access the API
  try {
    console.log('Testing direct Hugging Face API access...');
    const model = 'distilbert-base-uncased-finetuned-sst-2-english';
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: 'This prompt is very clear and well structured with detailed instructions.'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Direct API test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('❌ Direct API test failed:', error.message || 'Unknown error');
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
  
  // Then, test our evaluation function
  try {
    console.log('\nTesting prompt evaluation function...');
    const evaluation = await evaluatePromptWithAI(
      'Write a poem about the ocean that has exactly 4 lines and mentions seagulls.',
      'Craft a zero-shot prompt that asks the AI to generate a short poem about technology.',
      'Write a poem about the ocean that has exactly 4 lines and mentions seagulls.',
      'Write a short poem about technology that includes references to innovation and human connection. Use no more than 4 lines and include at least one metaphor.'
    );
    
    console.log('✅ Evaluation function test successful!');
    console.log('Evaluation:', JSON.stringify(evaluation, null, 2));
  } catch (error) {
    console.error('❌ Evaluation function test failed:', error);
  }
}

// Run the test
console.log('Starting Hugging Face API test...');
testHuggingFaceAPI()
  .then(() => console.log('Test complete.'))
  .catch(err => console.error('Unhandled error during test:', err));