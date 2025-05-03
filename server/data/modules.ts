import { Module } from "@shared/types";

export const modules: Module[] = [
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
        problem: 'Create a prompt that asks the AI to generate a list of 5 book recommendations for someone interested in artificial intelligence, with each recommendation including the title, author, and a one-sentence description.',
        example: 'Generate a table of 3 healthy breakfast recipes with columns for meal name, ingredients, and preparation time in minutes.',
        modelAnswer: 'List 5 book recommendations for someone interested in artificial intelligence. For each book, include: 1) Title, 2) Author name, and 3) A one-sentence description explaining its significance or main ideas. Present the results in a numbered list format.'
      },
      {
        id: 'zs-3',
        title: 'Role Assignment',
        description: 'Assign a specific role to the AI',
        problem: 'Write a prompt that instructs the AI to act as a financial advisor providing advice about saving for retirement.',
        example: 'Act as a historical scholar specializing in Ancient Rome and explain the significance of the Colosseum in Roman society.',
        modelAnswer: 'Act as an experienced financial advisor specializing in retirement planning. Provide detailed advice for a 35-year-old who wants to start saving for retirement. Include information about different investment vehicles (401k, IRA, etc.), suggestions for asset allocation based on age, and common pitfalls to avoid. Your advice should be comprehensive but accessible to someone with basic financial knowledge.'
      }
    ]
  },
  {
    id: 'chain-of-thought',
    title: 'Chain-of-Thought Prompting',
    description: 'Learn techniques to guide AI through step-by-step reasoning processes, improving the quality and reliability of complex outputs.',
    objectives: [
      'Understand the chain-of-thought prompting approach',
      'Learn to break down complex problems into reasoning steps',
      'Apply step-by-step thinking to improve AI outputs'
    ],
    concepts: [
      { term: 'Chain-of-Thought', definition: 'A prompting technique that guides AI through a series of connected reasoning steps' },
      { term: 'Intermediate Reasoning', definition: 'The explicit step-by-step thinking process between a question and its answer' },
      { term: 'Logical Decomposition', definition: 'Breaking a complex problem into simpler, sequential components' }
    ],
    exercises: [
      {
        id: 'cot-1',
        title: 'Reasoning Steps',
        description: 'Guide the AI through explicit reasoning steps',
        problem: 'Create a prompt that asks the AI to solve a math word problem by showing each step of the calculation.',
        example: 'Solve this problem step-by-step: If a store offers a 20% discount on a $80 item, and then applies a 10% coupon on top of the discounted price, what is the final price?',
        modelAnswer: 'I need you to solve the following math word problem step-by-step, showing all of your work and explaining your reasoning at each stage: A train leaves Station A traveling at 60 mph. Two hours later, another train leaves Station B (which is 300 miles away from Station A) traveling at 70 mph in the opposite direction, toward Station A. How long after the second train departs will the two trains meet? Show the equations you use and calculate the final answer.'
      },
      {
        id: 'cot-2',
        title: 'Analysis Framework',
        description: 'Provide a framework for analyzing a complex topic',
        problem: 'Write a prompt that guides the AI to analyze the pros and cons of remote work, asking it to consider at least 3 distinct categories of impact (e.g., productivity, work-life balance, company culture).',
        example: 'Analyze the impact of social media on teenagers by examining: 1) mental health effects, 2) social development, and 3) academic performance. For each area, provide evidence both for positive and negative impacts before reaching a conclusion.',
        modelAnswer: 'Analyze the pros and cons of remote work using the following structured approach:\n\n1. First, examine the impact on PRODUCTIVITY by considering:\n   - How does remote work affect individual focus and output?\n   - What challenges arise with team collaboration?\n   - How do communication tools enhance or hinder work?\n\n2. Next, analyze WORK-LIFE BALANCE:\n   - What flexibility benefits do employees gain?\n   - What boundary issues might emerge between personal and professional life?\n   - How does commute elimination affect overall wellbeing?\n\n3. Then, evaluate COMPANY CULTURE:\n   - How is team cohesion maintained or weakened?\n   - What happens to spontaneous innovation and idea-sharing?\n   - How do onboarding and mentorship change?\n\n4. Finally, consider ECONOMIC IMPACTS:\n   - What cost savings exist for both employers and employees?\n   - How are local economies affected?\n   - What infrastructure investments are required?\n\nFor each category, provide specific examples and evidence before drawing balanced conclusions.'
      },
      {
        id: 'cot-3',
        title: 'Decision Process',
        description: 'Guide the AI through a decision-making process',
        problem: 'Create a prompt that asks the AI to help decide between three different smartphone models by evaluating them across multiple factors (price, features, durability, etc.) before making a recommendation.',
        example: 'Help me decide whether to drive or take public transit to work by: 1) Listing the key factors to consider, 2) Evaluating each option against these factors, 3) Weighing the importance of each factor, and 4) Making a final recommendation based on this analysis.',
        modelAnswer: 'I need help choosing between the latest smartphone models: Phone A, Phone B, and Phone C. Guide me through a comprehensive decision-making process with these steps:\n\n1. First, IDENTIFY THE KEY DECISION FACTORS by:\n   - Listing the 5-7 most important factors when choosing a smartphone (e.g., price, camera quality, battery life, processing power, etc.)\n   - Briefly explaining why each factor matters\n\n2. Then, EVALUATE EACH PHONE by:\n   - Creating a comparison matrix showing how each phone rates on each factor\n   - Using a 1-10 scale for each factor\n   - Providing specific technical details for each rating\n\n3. Next, WEIGH THE FACTORS by:\n   - Asking me which factors matter most to me\n   - Suggesting a default weighting if I don\'t have preferences\n   - Calculating weighted scores based on the ratings and weights\n\n4. Finally, MAKE A RECOMMENDATION by:\n   - Identifying the phone with the highest weighted score\n   - Explaining the key advantages of the recommended phone\n   - Noting any significant drawbacks to consider\n   - Suggesting scenarios where one of the other phones might be better\n\nI\'m looking for a thorough, logical analysis that helps me understand the tradeoffs between these three options.'
      }
    ]
  },
  {
    id: 'few-shot',
    title: 'Few-Shot Prompting',
    description: 'Master the technique of providing examples in your prompts to guide AI towards producing outputs in your desired format and style.',
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
        example: 'Here are some examples of customer inquiries and appropriate responses:\nCustomer: "What are your business hours?"\nResponse: "Our store is open Monday-Friday from 9am-6pm and Saturday from 10am-4pm. We are closed on Sundays."\n\nCustomer: "Do you offer refunds?"\nResponse: "Yes, we offer full refunds within 30 days of purchase with a valid receipt."\n\nNow respond to this customer inquiry:\nCustomer: "Do you ship internationally?"',
        modelAnswer: 'Here are examples of fantasy creature names and their special abilities:\n\nCreature: Luminfrost\nAbility: Can create ice crystals that glow with healing light, illuminating dark caves while soothing wounds.\n\nCreature: Emberwing\nAbility: Feathers can detach and float independently as tiny scouts that transmit visual information telepathically back to the creature.\n\nCreature: Vinestalker\nAbility: Can merge with plant life, traveling instantly between connected vegetation while remaining completely undetected.\n\nNow create a new fantasy creature name and special ability following the same pattern and level of detail:'
      },
      {
        id: 'fs-2',
        title: 'Style Matching',
        description: 'Use examples to establish a specific writing style',
        problem: 'Write a prompt with examples that demonstrate a specific writing style (such as humorous, formal, or poetic), then ask the AI to write something new in that same style.',
        example: 'Here are examples of technical concepts explained in simple terms:\n\nAPI: A waiter that takes your order to the kitchen and brings back your food.\n\nEncryption: A secret language that turns your message into gibberish that only the intended recipient can translate back.\n\nNow explain what "Machine Learning" is using the same approachable style.',
        modelAnswer: 'Here are examples of explanations written in a friendly, conversational style with quirky humor:\n\nQuantum Physics: "Imagine if your pizza could exist both in your fridge AND in your stomach simultaneously - that is quantum physics for you!"\n\nPhotosynthesis: "Plants are basically solar-powered party machines! They soak up sunlight like gossip."\n\nThe Stock Market: "Picture a dramatic high school where popularity changes based on rumors and random events."\n\nNow, using this same conversational, quirky humor style, explain how social media algorithms work.'
      },
      {
        id: 'fs-3',
        title: 'Complex Pattern',
        description: 'Establish a complex pattern with examples',
        problem: 'Create a prompt with examples that establish a complex pattern for analyzing movies (including plot summary, themes, cinematography, and performance), then ask the AI to analyze a specific movie following that same structure.',
        example: 'Here are examples of bug reports:\n\nReport #1\nModule: User Authentication\nSeverity: High\nSteps to Reproduce: 1. Navigate to login page, 2. Enter valid username but incorrect password, 3. Click "Forgot Password"\nExpected Behavior: Password reset email is sent\nActual Behavior: Page refreshes but no email is sent and no error message appears\nEnvironment: Chrome 90, Windows 10\n\nReport #2\nModule: Shopping Cart\nSeverity: Medium\nSteps to Reproduce: 1. Add item to cart, 2. Proceed to checkout, 3. Return to shopping page\nExpected Behavior: Cart items remain saved\nActual Behavior: Cart is emptied when navigating away from checkout\nEnvironment: Safari 14, macOS Big Sur\n\nNow create a similar bug report for the following issue: When uploading profile pictures larger than 5MB, the application crashes.',
        modelAnswer: 'Here are examples of film analyses following a specific structured format:\n\n# FILM ANALYSIS: "The Shawshank Redemption" (1994)\n\n## PLOT OVERVIEW\nAndy Dufresne, a successful banker wrongfully convicted of murdering his wife and her lover, navigates the brutal realities of Shawshank prison over two decades. Through perseverance, friendship with fellow inmate Red, and small acts of dignity, Andy secretly engineers both his financial revenge and physical escape.\n\n## THEMATIC ANALYSIS\n* HOPE: Symbolized by Andy\'s persistent determination despite seemingly impossible circumstances\n* INSTITUTIONAL CORRUPTION: Explored through Warden Norton\'s hypocritical religious facade masking his criminal activities\n* REDEMPTION: Not through the legal system but through personal integrity and human connection\n\n## VISUAL STORYTELLING\n* CINEMATOGRAPHY: Roger Deakins uses oppressive framing in prison scenes contrasted with expansive landscape shots for moments of freedom\n* COLOR PALETTE: Transitions from cold, desaturated blues within prison to warm, natural tones in escape sequences\n* ICONIC SHOTS: The overhead rainstorm scene transforms Andy\'s escape into spiritual rebirth through visual baptism\n\n## PERFORMANCE HIGHLIGHTS\n* Tim Robbins as Andy: Masterfully portrays complexity through physical restraint and subtle emotional shifts\n* Morgan Freeman as Red: Delivers both powerful narration and nuanced character evolution through minimalist expressions\n* Supporting cast: Creates authentic prison ecosystem where each character feels fully realized\n\n# FILM ANALYSIS: "Parasite" (2019)\n\n## PLOT OVERVIEW\nThe impoverished Kim family infiltrates the wealthy Park household by posing as unrelated, qualified workers. Their elaborate deception unravels upon discovering the Parks\' previous housekeeper has hidden her debt-ridden husband in a secret basement bunker, ultimately leading to a violent collision between social worlds.\n\n## THEMATIC ANALYSIS\n* CLASS INEQUALITY: Visualized through vertical spaces (semi-basement vs. hilltop mansion) and access to resources\n* SYMBIOTIC RELATIONSHIPS: All characters both exploit and depend on others in an unsustainable social ecosystem\n* INVISIBLE VIOLENCE: Economic systems depicted as causing psychological damage before erupting into physical violence\n\n## VISUAL STORYTELLING\n* CINEMATOGRAPHY: Precisely composed frames emphasize architectural divisions mirroring social stratification\n* COLOR PALETTE: Contrasts between warm, natural lighting in wealthy spaces versus cold fluorescents in poor environments\n* SYMBOLIC IMAGERY: Recurring motifs of water (flooding as class equalizer) and smell (invisible social marker)\n\n## PERFORMANCE HIGHLIGHTS\n* Song Kang-ho as Father Kim: Projects complex mix of shame, ambition, and rage beneath seemingly jovial exterior\n* Cho Yeo-jeong as Mrs. Park: Embodiment of privileged naivety through studied mannerisms of constant distraction\n* Ensemble dynamic: Creates perfect tension between comedic timing and mounting psychological horror\n\n# FILM ANALYSIS: "The Matrix" (1999)\n\nNow analyze the film "The Matrix" (1999) following exactly the same structured format shown above, with the same main sections and subsection styles:'
      }
    ]
  }
];
