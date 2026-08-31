import { useEffect, useState } from 'react';
import { useCultivatorStore } from '../../hooks/useCultivator';
import GuVault from './GuVault';

interface ApertureModalProps {
  onClose?: () => void;
}

export default function ApertureModal({ onClose }: ApertureModalProps) {
  const { cultivator, guWorms, isLoading, fetchAperture, feedGu } = useCultivatorStore();
  const [subTab, setSubTab] = useState<'vault' | 'overview'>('vault');

  useEffect(() => {
    // Ensure we fetch the latest state if not already loaded
    if (!cultivator) {
      fetchAperture();
    }
  }, [cultivator, fetchAperture]);

  if (isLoading && !cultivator) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center text-[#d5cfc4] animate-pulse z-50 bg-[#12100d] bg-opacity-95 backdrop-blur-md font-serif">
        Expanding Consciousness into Primeval Aperture...
      </div>
    );
  }

  const isFractured = cultivator?.aperture_status === 'Fractured';

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#12100d]/95 backdrop-blur-2xl z-50 pt-8 pb-16 px-4 md:px-8 overflow-y-auto font-serif flex flex-col items-center select-none">
      
      {/* Top Exit Button */}
      {onClose && (
        <div className="w-full max-w-6xl flex justify-end mb-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-[#2a2620] hover:border-[#c89b3c]/50 text-[#8a8275] hover:text-[#d5cfc4] text-xs font-sans uppercase tracking-widest transition-all cursor-pointer shadow-lg"
          >
            ✕ Return to Overworld
          </button>
        </div>
      )}

      {/* Header & Cultivator Physique Summary */}
      <div className="w-full max-w-5xl mb-6 text-center relative animate-fade-in">
        <h1 className="text-4xl md:text-5xl text-[#3b4d3c] mb-2 tracking-[0.15em] font-light drop-shadow-[0_0_20px_rgba(59,77,60,0.6)]">
          Primeval Aperture & Vault
        </h1>
        <div className="w-64 h-0.5 bg-gradient-to-r from-transparent via-[#3b4d3c] to-transparent mx-auto mb-3"></div>
        <p className="text-[#8a8275] font-sans text-xs tracking-wide max-w-2xl mx-auto">
          The sacred inner realm where your Gu reside. Manage your 3 active combat techniques, nourish passive Gu into your mortal sinews, and store inactive Gu in your vault.
        </p>

        {/* Cultivator Body Stat Ribbon */}
        {cultivator && (
          <div className="mt-5 p-4 rounded-xl bg-black/60 border border-[#2a2620] flex flex-wrap items-center justify-around gap-4 font-sans text-xs shadow-lg max-w-3xl mx-auto">
            <div>
              <span className="text-[#8a8275] block text-[10px] uppercase tracking-wider">Cultivator</span>
              <span className="text-[#d5cfc4] font-bold text-sm">{cultivator.name} (Rank {cultivator.rank} • {cultivator.stage})</span>
            </div>
            <div>
              <span className="text-[#8a8275] block text-[10px] uppercase tracking-wider">Aperture Status</span>
              <span className={`font-bold text-sm ${isFractured ? 'text-[#c0392b]' : 'text-[#3b4d3c]'}`}>
                {isFractured ? '💀 Fractured (-5% Cap)' : '✨ Pristine (100%)'}
              </span>
            </div>
            <div>
              <span className="text-[#8a8275] block text-[10px] uppercase tracking-wider">Primeval Sea</span>
              <span className="text-[#3b4d3c] font-bold text-sm">{cultivator.primeval_essence}/{cultivator.max_essence}%</span>
            </div>
            <div>
              <span className="text-[#8a8275] block text-[10px] uppercase tracking-wider">Physical Strength</span>
              <span className="text-[#d5cfc4] font-bold text-sm">
                {cultivator.stats.strength.total} 
                <span className="text-[#3b4d3c] text-[11px] ml-1 font-normal">
                  ({cultivator.stats.strength.modifiers.length > 0 ? cultivator.stats.strength.modifiers.join(' + ') : 'Mortal'})
                </span>
              </span>
            </div>
            <div>
              <span className="text-[#8a8275] block text-[10px] uppercase tracking-wider">Body Tempering</span>
              <span className="text-[#d5cfc4] font-bold text-sm">
                {cultivator.stats.defense.total}
                <span className="text-[#3b4d3c] text-[11px] ml-1 font-normal">
                  ({cultivator.stats.defense.modifiers.length > 0 ? cultivator.stats.defense.modifiers.join(' + ') : 'Flesh'})
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Sub-Tab Navigation Switcher */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setSubTab('vault')}
            className={`px-5 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all border cursor-pointer ${
              subTab === 'vault'
                ? 'bg-[#3b4d3c]/40 border-[#3b4d3c] text-[#d5cfc4] shadow-[0_0_15px_rgba(59,77,60,0.3)]'
                : 'bg-black/40 border-[#2a2620] text-[#8a8275] hover:text-[#d5cfc4]'
            }`}
          >
            🏺 Gu Vault & Loadout (Max 3 Combat)
          </button>
          <button
            onClick={() => setSubTab('overview')}
            className={`px-5 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all border cursor-pointer ${
              subTab === 'overview'
                ? 'bg-[#c89b3c]/30 border-[#c89b3c] text-[#d5cfc4] shadow-[0_0_15px_rgba(200,155,60,0.2)]'
                : 'bg-black/40 border-[#2a2620] text-[#8a8275] hover:text-[#d5cfc4]'
            }`}
          >
            🎴 Aperture Feeding & Overview
          </button>
        </div>
      </div>

      {/* Main Content Area: Subtab View */}
      {subTab === 'vault' ? (
        <GuVault />
      ) : (
        /* Gu Cards Grid */
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {guWorms.map(gu => {
              const isPassive = gu.gu_type === 'passive_body';
              const isStarving = gu.hunger < 20;
              const isFullySated = gu.hunger >= 100;

              return (
                <div 
                  key={gu.id} 
                  className={`bg-[#171410]/80 p-5 rounded-2xl relative flex flex-col justify-between transition-all duration-300 border shadow-lg
                    ${isPassive ? 'border-[#3b4d3c]/40 hover:border-[#3b4d3c] hover:shadow-[0_0_25px_rgba(59,77,60,0.3)]' : 'border-[#c89b3c]/40 hover:border-[#c89b3c] hover:shadow-[0_0_25px_rgba(200,155,60,0.2)]'}
                  `}
                >
                  {/* Card Top */}
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg text-[#d5cfc4] font-bold tracking-wide">{gu.name}</h3>
                        <p className="text-[11px] text-[#8a8275] font-sans">{gu.path} • Tier {gu.tier}</p>
                      </div>
                      
                      {/* Category Badge */}
                      <div className={`px-2 py-0.5 rounded text-[9px] font-sans font-bold uppercase tracking-wider border
                        ${isPassive 
                          ? 'bg-[#3b4d3c]/20 text-[#3b4d3c] border-[#3b4d3c]/60' 
                          : 'bg-[#c89b3c]/20 text-[#c89b3c] border-[#c89b3c]/60'}
                      `}>
                        {isPassive ? 'Passive Body' : 'Active Tool'}
                      </div>
                    </div>

                    {/* Description / Effect */}
                    <p className="text-xs text-gray-300 font-sans leading-relaxed my-3 bg-black/40 p-2.5 rounded-lg border border-[#2a2620]">
                      {gu.effect_desc || 'A wondrous Gu worm residing in the aperture.'}
                    </p>

                    {/* Stat Impact / Combat Power Display */}
                    <div className="my-2 p-2 rounded-lg bg-black/30 font-sans text-xs">
                      {isPassive ? (
                        <div className="flex justify-between items-center">
                          <span className="text-[#8a8275] text-[11px] uppercase tracking-wider">Body Transformation:</span>
                          <span className={`font-bold ${isStarving ? 'text-[#5c2424] line-through' : 'text-[#c89b3c]'}`}>
                            {gu.passive_buff?.label || `+${gu.passive_buff?.value} ${gu.passive_buff?.stat}`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-[#8a8275] text-[11px] uppercase tracking-wider">Combat Power:</span>
                          <span className="text-[#c89b3c] font-bold">
                            {gu.active_power || 35} Pwr (Cost: {gu.essence_cost || 10}% Ess)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Hunger & Feeding */}
                  <div className="mt-3 pt-3 border-t border-[#2a2620]">
                    <div className="flex justify-between text-[10px] font-sans uppercase tracking-wider mb-1.5">
                      <span className="text-[#8a8275]">Hunger State</span>
                      <span className={isStarving ? 'text-[#5c2424] animate-pulse font-bold' : 'text-[#3b4d3c] font-bold'}>
                        {gu.hunger}% {isStarving && isPassive ? '(Buff Dormant!)' : ''}
                      </span>
                    </div>
                    
                    {/* Hunger Bar */}
                    <div className="w-full bg-[#12100d] rounded-full h-1.5 overflow-hidden mb-3 border border-[#2a2620]">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isStarving ? 'bg-[#5c2424]' : 'bg-[#3b4d3c]'}`} 
                        style={{ width: `${gu.hunger}%` }}
                      />
                    </div>

                    {/* Feed Button */}
                    <button 
                      onClick={() => feedGu(gu.id)}
                      disabled={isFullySated || isLoading}
                      className={`w-full py-2 flex items-center justify-center gap-2 text-xs font-sans tracking-wider uppercase rounded-lg transition-all border 
                        ${isFullySated 
                          ? 'bg-[#1a1814] text-zinc-600 border-[#2a2620] cursor-not-allowed opacity-50' 
                          : 'bg-[#12100d] hover:bg-[#3b4d3c]/20 text-[#d5cfc4] border-[#2a2620] hover:border-[#3b4d3c] cursor-pointer'}
                      `}
                    >
                      {isFullySated ? 'Gu is fully Sated' : `Feed ${gu.food || 'Primeval Stones'}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {guWorms.length === 0 && !isLoading && (
            <div className="text-center text-[#8a8275] italic mt-32 font-sans">
              Your Primeval Aperture is empty. Explore the Overworld or equip Gu from your Vault!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
