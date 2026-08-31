import { useState } from 'react';
import OverworldModal from './components/world/OverworldModal';
import MapGrid from './components/map/MapGrid';
import TaiwuHUD from './components/ui/TaiwuHUD';
import ApertureModal from './components/aperture/ApertureModal';
import CrucibleModal from './components/crucible/CrucibleModal';
import CombatArena from './components/views/CombatArena';
import { useCombatStore } from './hooks/useCombat';

export type ActiveTab = 'World' | 'Aperture' | 'Refine';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('World');
  const isCombatActive = useCombatStore((state) => state.isActive);

  // When the player enters a Node from the Overworld, we switch to the tile explorer
  const [activeNodeData, setActiveNodeData] = useState<any>(null);

  const handleEnterNode = (nodeData: any) => {
    setActiveNodeData(nodeData);
  };

  const handleExitNode = () => {
    setActiveNodeData(null);
  };

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden">

      {/* World View: Overworld Map or Node Tile Explorer */}
      <div className={`transition-opacity duration-500 ${activeTab === 'World' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
        {activeNodeData ? (
          // Inside a node — show the 15x15 local tile explorer
          <MapGrid 
            initialNodeData={activeNodeData} 
            onExitNode={handleExitNode} 
          />
        ) : (
          // Overworld map with 5 regions & nodes
          <OverworldModal onEnterNode={handleEnterNode} />
        )}
      </div>

      {/* Aperture Modal */}
      {activeTab === 'Aperture' && <ApertureModal />}

      {/* Refine Modal */}
      {activeTab === 'Refine' && <CrucibleModal />}

      {/* Persistent Taiwu HUD — hidden during active combat to avoid UI collision */}
      {!isCombatActive && (
        <TaiwuHUD
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Global Tactical Combat Arena */}
      <CombatArena />

    </div>
  );
}

export default App;
