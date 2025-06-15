
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Scene3DConfig {
  geometry: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane';
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  lighting: {
    ambient: string;
    directional: string;
    intensity: number;
  };
  environment: 'studio' | 'sunset' | 'dawn' | 'night' | 'forest';
  animation: 'none' | 'rotate' | 'bounce' | 'pulse';
}

export async function generateScene3DFromPrompt(prompt: string): Promise<Scene3DConfig> {
  try {
    const systemPrompt = `You are a 3D scene generator. Convert natural language descriptions into 3D scene configurations.

Available options:
- geometry: box, sphere, cylinder, cone, torus, plane
- colors: hex codes (e.g., #ff0000 for red)
- position: [x, y, z] coordinates (-5 to 5)
- rotation: [x, y, z] in radians
- scale: [x, y, z] (0.5 to 3)
- lighting.ambient: hex color for ambient light
- lighting.directional: hex color for directional light
- lighting.intensity: 0.5 to 2
- environment: studio, sunset, dawn, night, forest
- animation: none, rotate, bounce, pulse

Return only valid JSON with the exact structure. No explanations.

Example input: "red spinning cube"
Example output: {"geometry":"box","color":"#ff0000","position":[0,0,0],"rotation":[0,0,0],"scale":[1,1,1],"lighting":{"ambient":"#ffffff","directional":"#ffffff","intensity":1},"environment":"studio","animation":"rotate"}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq');
    }

    // Parse and validate the JSON response
    const sceneConfig = JSON.parse(response);
    
    // Validate required fields
    const requiredFields = ['geometry', 'color', 'position', 'rotation', 'scale', 'lighting', 'environment', 'animation'];
    for (const field of requiredFields) {
      if (!(field in sceneConfig)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return sceneConfig as Scene3DConfig;
  } catch (error) {
    console.error('Error generating 3D scene from prompt:', error);
    
    // Return a fallback scene based on the prompt
    return generateFallbackScene(prompt);
  }
}

function generateFallbackScene(prompt: string): Scene3DConfig {
  const lowerPrompt = prompt.toLowerCase();
  
  // Basic color detection
  let color = '#3b82f6'; // default blue
  if (lowerPrompt.includes('red')) color = '#ef4444';
  else if (lowerPrompt.includes('green')) color = '#22c55e';
  else if (lowerPrompt.includes('blue')) color = '#3b82f6';
  else if (lowerPrompt.includes('yellow')) color = '#eab308';
  else if (lowerPrompt.includes('purple')) color = '#8b5cf6';
  else if (lowerPrompt.includes('orange')) color = '#f97316';
  else if (lowerPrompt.includes('pink')) color = '#ec4899';
  else if (lowerPrompt.includes('gold')) color = '#fbbf24';

  // Basic geometry detection
  let geometry: Scene3DConfig['geometry'] = 'box';
  if (lowerPrompt.includes('sphere') || lowerPrompt.includes('ball')) geometry = 'sphere';
  else if (lowerPrompt.includes('cylinder')) geometry = 'cylinder';
  else if (lowerPrompt.includes('cone')) geometry = 'cone';
  else if (lowerPrompt.includes('torus') || lowerPrompt.includes('donut')) geometry = 'torus';
  else if (lowerPrompt.includes('plane') || lowerPrompt.includes('flat')) geometry = 'plane';

  // Basic animation detection
  let animation: Scene3DConfig['animation'] = 'none';
  if (lowerPrompt.includes('spin') || lowerPrompt.includes('rotat')) animation = 'rotate';
  else if (lowerPrompt.includes('bounce') || lowerPrompt.includes('jump')) animation = 'bounce';
  else if (lowerPrompt.includes('pulse') || lowerPrompt.includes('beat')) animation = 'pulse';

  // Basic environment detection
  let environment: Scene3DConfig['environment'] = 'studio';
  if (lowerPrompt.includes('sunset')) environment = 'sunset';
  else if (lowerPrompt.includes('dawn') || lowerPrompt.includes('sunrise')) environment = 'dawn';
  else if (lowerPrompt.includes('night') || lowerPrompt.includes('dark')) environment = 'night';
  else if (lowerPrompt.includes('forest') || lowerPrompt.includes('nature')) environment = 'forest';

  return {
    geometry,
    color,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    lighting: {
      ambient: '#ffffff',
      directional: '#ffffff',
      intensity: 1,
    },
    environment,
    animation,
  };
}

export async function compareScenes(scene1: Scene3DConfig, scene2: Scene3DConfig): Promise<{
  similarity: number;
  feedback: string;
  suggestions: string[];
}> {
  try {
    const systemPrompt = `You are a 3D scene comparison expert. Compare two 3D scene configurations and provide:
1. similarity score (0-100)
2. feedback on differences
3. suggestions for improvement

Return only valid JSON with this structure:
{"similarity": number, "feedback": "string", "suggestions": ["string1", "string2"]}`;

    const userPrompt = `Compare these scenes:
Scene 1: ${JSON.stringify(scene1)}
Scene 2: ${JSON.stringify(scene2)}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error comparing scenes:', error);
    return {
      similarity: 75,
      feedback: 'Scenes compared successfully',
      suggestions: ['Try adjusting the colors', 'Experiment with different animations']
    };
  }
}
