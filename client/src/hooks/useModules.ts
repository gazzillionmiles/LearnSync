
import { Module } from "@shared/types";

// Import hardcoded modules - we'll create this file
const hardcodedModules: Module[] = [
  {
    id: 'zero-shot',
    title: 'Zero-Shot Prompting',
    description: 'Learn how to create effective prompts without examples, giving clear instructions to AI models to generate desired outputs.',
    objectives: [
      'Understand the concept of zero-shot prompting',
      'Learn to craft clear, specific instructions',
      'Develop techniques to guide AI without examples'
    ],
    concepts: [
      { term: 'Zero-Shot Learning', definition: 'The ability of a model to perform tasks it hasn\'t been explicitly trained on' },
      { term: 'Instruction Clarity', definition: 'The precision and unambiguity of directions given to an AI model' },
      { term: 'Task Specification', definition: 'Clearly defining what you want the AI to accomplish' }
    ],
    exercises: [
      {
        id: 'zs-1',
        title: 'Basic Instructions',
        description: 'Create a simple prompt with clear instructions',
        problem: 'Craft a zero-shot prompt that asks the AI to generate a short poem about technology.',
        example: 'Write a poem about the ocean that has exactly 4 lines and mentions seagulls.',
        modelAnswer: 'Write a short poem about technology that includes references to innovation and human connection. Use no more than 4 lines and include at least one metaphor.'
      },
      {
        id: 'zs-2',
        title: 'Format Specification',
        description: 'Specify output format in your prompt',
        problem: 'Create a prompt that asks for a specific output format (JSON, list, table, etc.)',
        example: 'Generate a list of 5 programming languages in JSON format with name and difficulty level.',
        modelAnswer: 'Generate a JSON array containing 3 book recommendations. Each book should have title, author, genre, and a brief description (max 50 words).'
      }
    ]
  },
  {
    id: 'few-shot',
    title: 'Few-Shot Prompting',
    description: 'Master the art of providing examples to guide AI behavior and achieve consistent, high-quality outputs.',
    objectives: [
      'Understand how example-based prompting influences AI outputs',
      'Learn to craft effective examples that demonstrate patterns',
      'Apply few-shot techniques to achieve consistent results'
    ],
    concepts: [
      { term: 'Few-Shot Learning', definition: 'Providing the AI with a small number of examples to establish a pattern it should follow' },
      { term: 'Example Selection', definition: 'Strategically choosing examples that represent the range of expected outputs' },
      { term: 'Pattern Matching', definition: 'The AI\'s ability to recognize and continue patterns from limited examples' }
    ],
    exercises: [
      {
        id: 'fs-1',
        title: 'Simple Examples',
        description: 'Provide basic examples to establish a pattern',
        problem: 'Create a prompt with 2-3 examples that teach the AI to generate names for fantasy creatures along with their special abilities.',
        example: 'Here are some examples of customer inquiries and appropriate responses:\nCustomer: "What are your business hours?"\nResponse: "Our store is open Monday-Friday from 9am-6pm and Saturday from 10am-4pm. We are closed on Sundays."\n\nNow respond to this customer inquiry:\nCustomer: "Do you ship internationally?"',
        modelAnswer: 'Here are examples of fantasy creatures:\nDragon Whisperer - Can communicate telepathically with dragons\nShadow Walker - Becomes invisible in darkness\nStorm Caller - Controls weather patterns\n\nNow create a fantasy creature with a unique ability:'
      }
    ]
  },
  {
    id: 'chain-of-thought',
    title: 'Chain of Thought',
    description: 'Learn to break down complex problems into step-by-step reasoning processes for better AI performance.',
    objectives: [
      'Understand chain-of-thought reasoning principles',
      'Learn to structure multi-step problem solving',
      'Apply reasoning chains to complex tasks'
    ],
    concepts: [
      { term: 'Chain of Thought', definition: 'A prompting technique that encourages the AI to show its reasoning process step by step' },
      { term: 'Intermediate Steps', definition: 'Breaking down complex problems into smaller, manageable reasoning steps' },
      { term: 'Reasoning Transparency', definition: 'Making the AI\'s thought process visible and verifiable' }
    ],
    exercises: [
      {
        id: 'cot-1',
        title: 'Step-by-Step Reasoning',
        description: 'Guide AI through complex problem solving',
        problem: 'Create a prompt that uses chain-of-thought to solve a math word problem.',
        example: 'Solve this step by step:\nSarah has 15 apples. She gives 1/3 to her friend and eats 2. How many does she have left?\nStep 1: Calculate 1/3 of 15\nStep 2: Subtract the amount given away\nStep 3: Subtract the amount eaten',
        modelAnswer: 'Let\'s solve this step by step:\nA store sells 240 items in a day. 60% are books, 25% are electronics, and the rest are clothes. How many clothes were sold?\nStep 1: Calculate books sold (60% of 240)\nStep 2: Calculate electronics sold (25% of 240)\nStep 3: Calculate clothes sold (remaining percentage)'
      }
    ]
  }
];

export function useModules() {
  // Return hardcoded modules immediately
  const modules = hardcodedModules;
  const isLoadingModules = false;
  const modulesError = null;

  // Get a specific module by ID
  const getModuleById = (moduleId: string) => {
    return modules.find(module => module.id === moduleId);
  };

  // Get a specific exercise from a module
  const getExerciseById = (moduleId: string, exerciseId: string) => {
    const module = getModuleById(moduleId);
    if (!module) return undefined;
    
    return module.exercises.find(exercise => exercise.id === exerciseId);
  };

  // Get the next exercise in a module after the current one
  const getNextExercise = (moduleId: string, currentExerciseId: string) => {
    const module = getModuleById(moduleId);
    if (!module) return undefined;
    
    const currentIndex = module.exercises.findIndex(ex => ex.id === currentExerciseId);
    if (currentIndex === -1 || currentIndex === module.exercises.length - 1) {
      return undefined;
    }
    
    return module.exercises[currentIndex + 1];
  };

  return {
    modules,
    isLoadingModules,
    modulesError,
    getModuleById,
    getExerciseById,
    getNextExercise
  };
}
