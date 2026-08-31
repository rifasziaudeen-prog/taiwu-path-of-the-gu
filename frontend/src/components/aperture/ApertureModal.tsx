import { useEffect, useState } from 'react';
import { useCultivatorStore } from '../../hooks/useCultivator';
import GuVault from './GuVault';

export default function ApertureModal() {
  const { cultivator, guWorms, isLoading, fetchAperture, feedGu, ascend } = useCultivatorStore();
  const [isAscending, setIsAscending] = useState(false);
  const [ascendMsg, setAscendMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [subTab, setSubTab] = useState<'vault' | 'overview'>('vault');

  useEffect(() => {
    // Ensure we fetch the latest state if not already loaded
    if (!cultivator) {
      fetchAperture();
    }
  }, [cultivator, fetchAperture]);

  if (isLoading && !cultivator) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-[#d5cfc4] animate-pulse z-40 bg-[#12100d] bg-opacity-90 backdrop-blur-md font-serif">
        Expanding Consciousness into Primeval Aperture...
      </div>
    );
  }

  const isPeakStage = cultivator?.stage.toLowerCase().includes('peak') ?? false;
  const requiredEssence = cultivator ? Math.floor(cultivator.max_essence * 0.9) : 90;
  const canAffordAscension = cultivator ? cultivator.primeval_essence >= requiredEssence : false;
  const isFractured = cultivator?.aperture_status === 'Fractured';
  
  // Calculate success rate strictly by grade (Lore: A=90%, B=60%, C=30%, D=10%)
  let successRate = 40;
  if (cultivator?.aperture_grade) {
    const grade = cultivator.aperture_grade.toUpperCase();
    if (grade.includes('A')) successRate = 90;
    else if (grade.includes('B')) successRate = 60;
    else if (grade.includes('C')) successRate = 30;
    else if (grade.includes('D')) successRate = 10;
  }

  const handleAscend = async () => {
    setIsAscending(true);
    setAscendMsg(null);
    try {
      const res = await ascend();
      if (res.success && res.wall_broken) {
        setAscendMsg({ text: res.message, success: true });
      } else if (res.fractured) {
        setAscendMsg({ 
          text: res.message, 
          success: false 
        });
      } else {
        setAscendMsg({ 
          text: res.message || '💥 The crystal wall resisted your essence onslaught! Breakthrough failed.', 
          success: false 
        });
      }
    } catch (err: any) {
      setAscendMsg({ text: err.message || 'Ascension attempt failed.', success: false });
    } finally {
      setIsAscending(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#12100d]/90 backdrop-blur-2xl z-40 pt-12 pb-64 px-8 overflow-y-auto font-serif flex flex-col items-center select-none">
      
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

      {/* Mortal Breakthrough Banner (Only at Peak Stage) */}
      {isPeakStage && cultivator && (
        <div className="w-full max-w-5xl mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#171410] via-[#241a12] to-[#171410] border-2 border-[#c89b3c]/60 shadow-[0_0_40px_rgba(200,155,60,0.25)] animate-fade-in relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl pointer-events-none select-none">
            ⚡
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] font-sans font-bold">
                  ⚡ Peak Bottleneck Reached
                </span>
                <span className="text-[10px] bg-[#c89b3c]/20 border border-[#c89b3c] text-[#c89b3c] px-2 py-0.5 rounded font-sans uppercase font-bold">
                  {cultivator.aperture_grade}
                </span>
              </div>
              <h2 className="text-2xl text-[#d5cfc4] font-bold tracking-wider">
                Batter Aperture Wall & Ascend to Rank {cultivator.rank + 1}
              </h2>
              <p className="text-xs text-[#8a8275] font-sans mt-1 leading-relaxed max-w-xl">
                Mobilize your full primeval essence to violently batter against the crystal aperture wall. Mortals are strictly bounded by aptitude grade. 
                <span className="text-[#c0392b] block mt-1">⚠️ Beware: Failure carries a 15% risk of Aperture Fracture, permanently crippling your maximum essence capacity by 5%.</span>
              </p>

              {/* Requirements & Odds Bar */}
              <div className="flex flex-wrap gap-4 mt-3 font-sans text-xs">
                <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-[#2a2620]">
                  <span className="text-[#8a8275] text-[10px] uppercase block">Essence Battered:</span>
                  <span className={canAffordAscension ? 'text-[#3b4d3c] font-bold' : 'text-[#5c2424] font-bold'}>
                    {requiredEssence}% Essence ({cultivator.primeval_essence}% Available)
                  </span>
                </div>
                <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-[#2a2620]">
                  <span className="text-[#8a8275] text-[10px] uppercase block">Aptitude Success Odds:</span>
                  <span className="text-[#c89b3c] font-bold">
                    {successRate}% Breakthrough Chance
                  </span>
                </div>
                <div className="bg-black/50 px-3 py-1.5 rounded-lg border border-[#5c2424]/40">
                  <span className="text-[#8a8275] text-[10px] uppercase block">Fracture Risk:</span>
                  <span className="text-[#c0392b] font-bold">
                    15% on Failure (-5% Max Sea)
                  </span>
                </div>
              </div>
            </div>

            {/* Breakthrough Action Button */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleAscend}
                disabled={!canAffordAscension || isAscending}
                className={`py-3.5 px-8 rounded-xl font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-xl border
                  ${canAffordAscension && !isAscending
                    ? 'bg-gradient-to-r from-[#c89b3c] to-[#8B6914] text-[#12100d] hover:brightness-110 hover:shadow-[0_0_25px_rgba(200,155,60,0.6)] border-[#c89b3c] cursor-pointer'
                    : 'bg-[#1a1814] text-zinc-600 border-[#2a2620] cursor-not-allowed opacity-60'}
                `}
              >
                {isAscending ? 'Battering Wall...' : '⚡ Shatter Aperture Wall'}
              </button>
              {!canAffordAscension && (
                <span className="text-[10px] text-[#5c2424] font-sans mt-1.5 text-center">
                  Requires at least {requiredEssence}% Primeval Essence
                </span>
              )}
            </div>
          </div>

          {/* Feedback Message */}
          {ascendMsg && (
            <div className={`mt-4 p-3.5 rounded-lg border text-xs font-sans font-bold text-center animate-fade-in
              ${ascendMsg.success 
                ? 'bg-[#3b4d3c]/30 border-[#3b4d3c] text-emerald-300 shadow-[0_0_20px_rgba(59,77,60,0.3)]' 
                : 'bg-[#5c2424]/40 border-red-500 text-red-300 shadow-[0_0_20px_rgba(92,36,36,0.5)]'}
            `}>
              {ascendMsg.text}
            </div>
          )}
        </div>
      )}

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
