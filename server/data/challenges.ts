
import type { Challenge } from "@shared/types";

export const challenges: Challenge[] = [
  // Bronze Level - Basic Geometry
  {
    id: 'bronze-cube-dance',
    title: 'Make the Cube Dance',
    description: 'Create a prompt that generates a colorful rotating cube with smooth animation',
    difficulty: 'bronze',
    category: 'animation',
    expectedPrompt: 'Create a vibrant red cube that rotates smoothly on its Y-axis with a rotation speed of 0.02 radians per frame',
    sceneTemplate: {
      geometry: 'cube',
      material: { color: '#ff0000' },
      animation: { type: 'rotate', speed: 1 }
    },
    successCriteria: {
      minScore: 7,
      requiredElements: ['cube', 'rotation', 'color']
    },
    hints: [
      'Specify the shape you want',
      'Mention the type of movement',
      'Include a color preference'
    ],
    estimatedTime: 5
  },
  {
    id: 'bronze-sunset-scene',
    title: 'Render a Sunset Scene',
    description: 'Design a simple sunset landscape with warm lighting and a plane ground',
    difficulty: 'bronze',
    category: 'lighting',
    expectedPrompt: 'Generate a flat plane ground with warm orange ambient lighting (intensity 0.8) and a golden directional light positioned high in the sky to simulate sunset',
    sceneTemplate: {
      geometry: 'plane',
      material: { color: '#8B4513' },
      lighting: {
        ambient: { intensity: 0.8, color: '#FFA500' },
        directional: { intensity: 1.2, color: '#FFD700', position: [10, 20, 5] }
      }
    },
    successCriteria: {
      minScore: 6,
      requiredElements: ['plane', 'warm lighting', 'sunset']
    },
    hints: [
      'Think about the ground surface',
      'Consider warm sunset colors',
      'Lighting direction matters'
    ],
    estimatedTime: 8
  },

  // Silver Level - Intermediate Concepts
  {
    id: 'silver-metallic-sphere',
    title: 'Craft a Metallic Sphere',
    description: 'Create a highly reflective metallic sphere with realistic material properties',
    difficulty: 'silver',
    category: 'materials',
    expectedPrompt: 'Generate a sphere with high metalness (0.9), low roughness (0.1), silver color (#C0C0C0), and strong directional lighting to showcase the metallic reflections',
    sceneTemplate: {
      geometry: 'sphere',
      material: { 
        color: '#C0C0C0', 
        metalness: 0.9, 
        roughness: 0.1 
      },
      lighting: {
        ambient: { intensity: 0.3, color: '#ffffff' },
        directional: { intensity: 2.0, color: '#ffffff', position: [5, 5, 5] }
      }
    },
    successCriteria: {
      minScore: 8,
      requiredElements: ['sphere', 'metallic', 'reflective', 'lighting']
    },
    hints: [
      'Material properties are key',
      'Metalness and roughness values',
      'Strong lighting enhances reflections'
    ],
    estimatedTime: 12
  },
  {
    id: 'silver-particle-storm',
    title: 'Create a Particle Storm',
    description: 'Generate an animated particle system with floating elements',
    difficulty: 'silver',
    category: 'particles',
    expectedPrompt: 'Create a particle system with 200 small white particles floating randomly around a central blue cube, with particles moving in a gentle swirling motion',
    sceneTemplate: {
      geometry: 'cube',
      material: { color: '#0066ff' },
      particles: {
        count: 200,
        type: 'points',
        color: '#ffffff'
      }
    },
    successCriteria: {
      minScore: 8,
      requiredElements: ['particles', 'animation', 'central object']
    },
    hints: [
      'Specify particle count and behavior',
      'Include a central focus object',
      'Describe the motion pattern'
    ],
    estimatedTime: 15
  },

  // Gold Level - Advanced Compositions
  {
    id: 'gold-futuristic-cityscape',
    title: 'Futuristic Cityscape',
    description: 'Design a complex scene with multiple geometric buildings, dynamic lighting, and atmospheric particles',
    difficulty: 'gold',
    category: 'geometry',
    expectedPrompt: 'Create a futuristic cityscape with 5 different height rectangular buildings arranged in a grid, neon blue and purple lighting from multiple angles, metallic materials with varying roughness, and atmospheric fog particles creating depth',
    sceneTemplate: {
      geometry: 'cube', // Will be multiple
      material: { 
        color: '#333333', 
        metalness: 0.7, 
        roughness: 0.3 
      },
      lighting: {
        ambient: { intensity: 0.2, color: '#0066ff' },
        directional: { intensity: 1.5, color: '#9966ff', position: [-5, 10, 5] }
      },
      particles: {
        count: 100,
        type: 'fog',
        color: '#666666'
      }
    },
    successCriteria: {
      minScore: 9,
      requiredElements: ['multiple objects', 'complex lighting', 'materials', 'atmosphere']
    },
    hints: [
      'Think about urban architecture',
      'Multiple light sources create depth',
      'Atmospheric effects add realism',
      'Vary object properties for interest'
    ],
    estimatedTime: 25
  }
];

export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find(challenge => challenge.id === id);
}

export function getChallengesByDifficulty(difficulty: 'bronze' | 'silver' | 'gold'): Challenge[] {
  return challenges.filter(challenge => challenge.difficulty === difficulty);
}

export function getChallengesByCategory(category: string): Challenge[] {
  return challenges.filter(challenge => challenge.category === category);
}
