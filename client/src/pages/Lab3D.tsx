
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Canvas3D from '@/components/Canvas3D';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Share2, Sparkles, Target } from 'lucide-react';
import type { Scene3D } from '@shared/types';

const DEFAULT_SCENE: Scene3D['sceneConfig'] = {
  geometry: 'box',
  color: '#3b82f6',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  lighting: {
    ambient: '#ffffff',
    directional: '#ffffff',
    intensity: 1,
  },
  environment: 'studio',
  animation: 'none',
};

const TEMPLATES = [
  {
    name: 'Floating Cube',
    prompt: 'A blue cube floating in space',
    config: { ...DEFAULT_SCENE, animation: 'bounce' as const },
  },
  {
    name: 'Golden Sphere',
    prompt: 'A golden sphere with warm lighting',
    config: { 
      ...DEFAULT_SCENE, 
      geometry: 'sphere' as const, 
      color: '#fbbf24',
      lighting: { ambient: '#fbbf24', directional: '#fff7ed', intensity: 1.2 }
    },
  },
  {
    name: 'Spinning Torus',
    prompt: 'A purple torus spinning slowly',
    config: { 
      ...DEFAULT_SCENE, 
      geometry: 'torus' as const, 
      color: '#8b5cf6',
      animation: 'rotate' as const 
    },
  },
];

export default function Lab3D() {
  const { user } = useAuth();
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [sceneConfig, setSceneConfig] = useState<Scene3D['sceneConfig']>(DEFAULT_SCENE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scenes, setScenes] = useState<Scene3D[]>([]);

  const processPrompt = async () => {
    if (!currentPrompt.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/lab3d/process-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt }),
      });
      
      if (response.ok) {
        const newConfig = await response.json();
        setSceneConfig(newConfig);
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveScene = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/lab3d/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentPrompt || 'Untitled Scene',
          prompt: currentPrompt,
          sceneConfig,
        }),
      });
      
      if (response.ok) {
        const newScene = await response.json();
        setScenes([newScene, ...scenes]);
      }
    } catch (error) {
      console.error('Error saving scene:', error);
    }
  };

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    setCurrentPrompt(template.prompt);
    setSceneConfig(template.config);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          3D Prompt Lab
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Transform your words into interactive 3D scenes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Prompt Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your 3D scene... (e.g., 'A red spinning cube with blue lighting')"
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                className="min-h-24"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={processPrompt} 
                  disabled={isProcessing || !currentPrompt.trim()}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Generate Scene'}
                </Button>
                <Button onClick={saveScene} variant="outline" size="icon">
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start"
                    onClick={() => loadTemplate(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - 3D Canvas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>3D Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Canvas3D sceneConfig={sceneConfig} />
              <div className="mt-4 flex gap-2">
                <Badge variant="secondary">{sceneConfig.geometry}</Badge>
                <Badge variant="secondary">{sceneConfig.animation}</Badge>
                <Badge variant="secondary">{sceneConfig.environment}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="gallery" className="w-full">
        <TabsList>
          <TabsTrigger value="gallery">My Gallery</TabsTrigger>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="leaderboard">Community</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Saved Scenes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenes.length === 0 ? (
                  <p className="text-gray-500 col-span-full text-center py-8">
                    No scenes saved yet. Create your first 3D scene!
                  </p>
                ) : (
                  scenes.map((scene) => (
                    <div key={scene.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-medium truncate">{scene.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 truncate">{scene.prompt}</p>
                      <div className="flex justify-between items-center mt-3">
                        <Badge variant="outline">{scene.sceneConfig.geometry}</Badge>
                        <Button size="sm" variant="ghost">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="missions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Daily Missions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Missions coming soon! Practice challenges to earn badges.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Community Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Community features coming soon! Share and discover amazing 3D creations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
