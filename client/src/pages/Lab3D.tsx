
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThreeDCanvas from '../components/ThreeDCanvas';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sparkles, Trophy, Save, Share2 } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'bronze' | 'silver' | 'gold';
  category: string;
  expectedPrompt: string;
  sceneTemplate: any;
  successCriteria: {
    minScore: number;
    requiredElements: string[];
  };
  hints: string[];
  estimatedTime: number;
}

const defaultSceneConfig = {
  objects: [
    {
      id: 'default-cube',
      type: 'cube' as const,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      material: {
        color: '#ff6b6b',
        metalness: 0.3,
        roughness: 0.4,
      },
    },
  ],
  lighting: {
    ambient: { intensity: 0.4, color: '#ffffff' },
    directional: { intensity: 1.0, color: '#ffffff', position: [5, 5, 5] as [number, number, number] },
  },
  environment: {
    background: '#1a1a2e',
  },
};

export default function Lab3D() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [sceneConfig, setSceneConfig] = useState(defaultSceneConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [savedScenes, setSavedScenes] = useState<any[]>([]);

  useEffect(() => {
    fetchChallenges();
    fetchSavedScenes();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/3d/challenges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const challengesData = await response.json();
        setChallenges(challengesData);
        if (challengesData.length > 0) {
          setSelectedChallenge(challengesData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchSavedScenes = async () => {
    try {
      const response = await fetch('/api/3d/scenes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const scenes = await response.json();
        setSavedScenes(scenes);
      }
    } catch (error) {
      console.error('Error fetching saved scenes:', error);
    }
  };

  const generateScene = async () => {
    if (!selectedChallenge || !userPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/3d/generate-scene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          challengeId: selectedChallenge.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFeedback(result);
        
        // Update scene based on challenge template
        const newSceneConfig = {
          ...defaultSceneConfig,
          objects: [
            {
              ...defaultSceneConfig.objects[0],
              type: selectedChallenge.sceneTemplate.geometry || 'cube',
              material: {
                ...defaultSceneConfig.objects[0].material,
                ...selectedChallenge.sceneTemplate.material,
              },
            },
          ],
          lighting: selectedChallenge.sceneTemplate.lighting || defaultSceneConfig.lighting,
        };
        
        setSceneConfig(newSceneConfig);
      }
    } catch (error) {
      console.error('Error generating scene:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveScene = async () => {
    if (!userPrompt.trim()) return;

    try {
      const response = await fetch('/api/3d/save-scene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          sceneData: sceneConfig,
          title: selectedChallenge?.title || 'My 3D Scene',
        }),
      });

      if (response.ok) {
        fetchSavedScenes();
        console.log('Scene saved successfully!');
      }
    } catch (error) {
      console.error('Error saving scene:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            3D Prompt Lab
            <Sparkles className="w-8 h-8 text-purple-400" />
          </h1>
          <p className="text-gray-300 text-lg">
            Create stunning 3D scenes with natural language prompts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenge Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedChallenge?.id === challenge.id
                        ? 'bg-purple-600/50 border border-purple-400'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium text-sm">{challenge.title}</h3>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-xs">{challenge.description}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      {challenge.estimatedTime} min • {challenge.category}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3D Canvas */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <ThreeDCanvas 
                  sceneConfig={sceneConfig}
                  onSceneUpdate={setSceneConfig}
                />
              </CardContent>
            </Card>

            {/* Prompt Input */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedChallenge ? `Challenge: ${selectedChallenge.title}` : 'Free Mode'}
                </CardTitle>
                {selectedChallenge && (
                  <p className="text-gray-300 text-sm">{selectedChallenge.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Describe your 3D scene... (e.g., 'Create a metallic sphere with blue lighting')"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                />
                
                <div className="flex gap-3">
                  <Button
                    onClick={generateScene}
                    disabled={isGenerating || !userPrompt.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Scene'}
                  </Button>
                  
                  <Button
                    onClick={saveScene}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Feedback Display */}
                {feedback && (
                  <div className="mt-4 p-4 bg-black/20 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Evaluation Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-300">
                        Score: <span className="text-purple-400 font-medium">{feedback.score}/10</span>
                      </div>
                      <div className="text-gray-300">
                        Semantic Similarity: <span className="text-purple-400 font-medium">{Math.round(feedback.semanticSimilarity * 100)}%</span>
                      </div>
                      {feedback.suggestions && feedback.suggestions.length > 0 && (
                        <div>
                          <div className="text-gray-300 mb-1">Suggestions:</div>
                          <ul className="text-gray-400 text-xs space-y-1">
                            {feedback.suggestions.map((suggestion: string, index: number) => (
                              <li key={index}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Hints */}
                {selectedChallenge && selectedChallenge.hints && (
                  <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
                    <h4 className="text-blue-300 font-medium text-sm mb-2">💡 Hints</h4>
                    <ul className="text-blue-200 text-xs space-y-1">
                      {selectedChallenge.hints.map((hint, index) => (
                        <li key={index}>• {hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
