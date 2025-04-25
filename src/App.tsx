import React from 'react';
import { Percent as Soccer, Share2 } from 'lucide-react';
import TacticalBoard from './components/TacticalBoard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900">
      <header className="bg-green-950/50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Soccer className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Tactical Board</h1>
            </div>
            <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <TacticalBoard />
      </main>
    </div>
  );
}

export default App;