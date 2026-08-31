import { useEffect } from 'react';
import { useVaultStore } from '../../hooks/useVault';
import { useCultivatorStore } from '../../hooks/useCultivator';
import type { GuWorm } from '../../types/api';

export default function GuVault() {
  const { 
    equippedGu, vaultGu, vaultCapacity, maxActiveSlots, equippedActiveCount,
    isLoading, feedbackMessage, fetchVault, equipGu, unequipGu, clearFeedback 
  } = useVaultStore();
  const { cultivator } = useCultivatorStore();

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  const activeCombatGu = equippedGu.filter(g => g.gu_type === 'active');
  const passiveBodyGu = equippedGu.filter(g => g.gu_type === 'passive_body');

  // Fill array of active combat slots up to maxActiveSlots (3)
  const combatSlots: (GuWorm | null)[] = [
    activeCombatGu[0] || null,
    activeCombatGu[1] || null,
    activeCombatGu[2] || null
  ];

  // Fill array of vault slots up to vaultCapacity (Rank * 5)
  const emptyVaultSlotsCount = Math.max(0, vaultCapacity - vaultGu.length);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 font-serif select-none animate-fade-in">
      
      {/* Top Vault Summary Ribbon */}
      <div className="bg-[#12100d]/90 backdrop-blur-md border border-[#2a2620] rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3b4d3c]/20 border border-[#3b4d3c] flex items-center justify-center text-lg">
            🏺
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#d5cfc4] tracking-wider">Primeval Gu Vault</h3>
            <span className="text-[10px] text-[#8a8275] uppercase tracking-wider">Rank {cultivator?.rank || 1} Storage Matrix</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-black/60 px-3.5 py-2 rounded-xl border border-[#2a2620] flex flex-col">
            <span className="text-[10px] text-[#8a8275] uppercase">Active Combat Slots</span>
            <span className={`font-bold text-sm ${equippedActiveCount >= maxActiveSlots ? 'text-[#c89b3c]' : 'text-emerald-400'}`}>
              {equippedActiveCount} / {maxActiveSlots} Max Equipped
            </span>
          </div>

          <div className="bg-black/60 px-3.5 py-2 rounded-xl border border-[#2a2620] flex flex-col">
            <span className="text-[10px] text-[#8a8275] uppercase">Inactive Storage Capacity</span>
            <span className={`font-bold text-sm ${vaultGu.length >= vaultCapacity ? 'text-red-400' : 'text-[#3b4d3c]'}`}>
              {vaultGu.length} / {vaultCapacity} Slots Used
            </span>
          </div>
        </div>
      </div>

      {/* Alert / Feedback Notification */}
      {feedbackMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-sans font-semibold flex justify-between items-center animate-fade-in ${
          feedbackMessage.type === 'success' 
            ? 'bg-[#3b4d3c]/30 border-[#3b4d3c] text-emerald-300' 
            : 'bg-[#5c2424]/40 border-red-500 text-red-300'
        }`}>
          <span>{feedbackMessage.text}</span>
          <button 
            onClick={clearFeedback}
            className="text-[10px] text-gray-400 hover:text-white uppercase tracking-wider ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ZONE 1: ACTIVE COMBAT APERTURE & EQUIPPED LOADOUT */}
      <div className="bg-[#171410]/90 backdrop-blur-md border-2 border-[#c89b3c]/50 rounded-2xl p-6 shadow-[0_0_35px_rgba(200,155,60,0.15)] relative">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#2a2620]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#c89b3c] font-sans font-bold">Zone 1</span>
              <span className="text-[10px] bg-[#c89b3c]/20 border border-[#c89b3c] text-[#c89b3c] px-2 py-0.5 rounded font-sans uppercase font-bold">
                Combat Aperture
              </span>
            </div>
            <h2 className="text-xl text-[#d5cfc4] font-bold tracking-wider mt-0.5">Active Combat Gu (Max 3 Slots)</h2>
          </div>
          <span className="text-xs text-[#8a8275] font-sans">
            Gu actively equipped for combat techniques in the Arena.
          </span>
        </div>

        {/* 3 Active Combat Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {combatSlots.map((gu, index) => {
            if (gu) {
              return (
                <div 
                  key={gu.id}
                  className="bg-[#12100d] border border-[#c89b3c]/70 rounded-xl p-4 flex flex-col justify-between shadow-lg relative group hover:border-[#c89b3c] transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#c89b3c] font-sans font-bold block">
                        Slot {index + 1} • Active
                      </span>
                      <h4 className="text-base text-[#d5cfc4] font-bold">{gu.name}</h4>
                      <span className="text-[10px] text-[#8a8275] font-sans">Tier {gu.tier} • {gu.path}</span>
                    </div>
                    <span className="text-[10px] bg-[#c89b3c]/20 border border-[#c89b3c]/60 text-[#c89b3c] px-2 py-0.5 rounded font-sans font-bold">
                      {gu.active_power} DMG
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-300 font-sans leading-relaxed my-2 bg-black/40 p-2 rounded border border-[#2a2620]">
                    {gu.effect_desc}
                  </p>

                  <div className="mt-2 pt-2 border-t border-[#2a2620] flex justify-between items-center font-sans text-xs">
                    <span className="text-[#8a8275] text-[10px]">Cost: {gu.essence_cost}% Ess</span>
                    <button
                      onClick={() => unequipGu(gu.id)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-[#5c2424]/40 hover:bg-[#5c2424] border border-red-800 text-red-300 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                    >
                      Unequip
                    </button>
                  </div>
                </div>
              );
            } else {
              return (
                <div 
                  key={`empty_combat_${index}`}
                  className="bg-[#12100d]/40 border-2 border-dashed border-[#2a2620] hover:border-[#c89b3c]/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px] text-center transition-all"
                >
                  <span className="text-2xl text-[#2a2620] mb-2">⚔️</span>
                  <span className="text-xs text-[#8a8275] font-sans uppercase tracking-widest font-semibold">
                    Combat Slot {index + 1} Empty
                  </span>
                  <span className="text-[10px] text-gray-500 font-sans mt-1">
                    Equip an active Gu from Vault
                  </span>
                </div>
              );
            }
          })}
        </div>

        {/* Equipped Passive Body Gu Sub-section */}
        {passiveBodyGu.length > 0 && (
          <div className="pt-4 border-t border-[#2a2620]">
            <h3 className="text-xs uppercase tracking-widest text-[#3b4d3c] font-sans font-bold mb-3">
              Equipped Passive Body Nourishment Gu ({passiveBodyGu.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {passiveBodyGu.map(gu => (
                <div 
                  key={gu.id}
                  className="bg-[#12100d] border border-[#3b4d3c]/60 rounded-xl p-3.5 flex justify-between items-center shadow"
                >
                  <div>
                    <h5 className="text-xs font-bold text-[#d5cfc4]">{gu.name}</h5>
                    <span className="text-[10px] text-[#3b4d3c] font-sans font-semibold">
                      {gu.passive_buff?.label || `+${gu.passive_buff?.value} ${gu.passive_buff?.stat}`}
                    </span>
                  </div>
                  <button
                    onClick={() => unequipGu(gu.id)}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-black/50 hover:bg-[#5c2424]/40 border border-[#2a2620] hover:border-red-700 text-gray-400 hover:text-red-300 rounded text-[9px] uppercase font-sans font-bold tracking-wider transition-all cursor-pointer"
                  >
                    Unequip
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ZONE 2: INACTIVE STORAGE (PRIMEVAL VAULT) */}
      <div className="bg-[#12100d]/90 backdrop-blur-md border border-[#2a2620] rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#2a2620]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#3b4d3c] font-sans font-bold">Zone 2</span>
              <span className="text-[10px] bg-[#3b4d3c]/20 border border-[#3b4d3c] text-[#3b4d3c] px-2 py-0.5 rounded font-sans uppercase font-bold">
                Inactive Storage
              </span>
            </div>
            <h2 className="text-xl text-[#d5cfc4] font-bold tracking-wider mt-0.5">
              Vault Reserves ({vaultGu.length} / {vaultCapacity} Slots)
            </h2>
          </div>
          <span className="text-xs text-[#8a8275] font-sans">
            Gu resting in dormant state inside the Vault.
          </span>
        </div>

        {/* Vault Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vaultGu.map(gu => {
            const isActiveType = gu.gu_type === 'active';
            const canEquipActive = !isActiveType || equippedActiveCount < maxActiveSlots;

            return (
              <div 
                key={gu.id}
                className="bg-[#171410] border border-[#2a2620] hover:border-[#3b4d3c] p-4 rounded-xl flex flex-col justify-between shadow transition-all duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h4 className="text-base text-[#d5cfc4] font-bold">{gu.name}</h4>
                      <span className="text-[10px] text-[#8a8275] font-sans">Tier {gu.tier} • {gu.path}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-sans font-bold uppercase tracking-wider border ${
                      isActiveType 
                        ? 'bg-[#c89b3c]/10 text-[#c89b3c] border-[#c89b3c]/40' 
                        : 'bg-[#3b4d3c]/10 text-[#3b4d3c] border-[#3b4d3c]/40'
                    }`}>
                      {isActiveType ? 'Active Combat' : 'Passive Body'}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 font-sans leading-relaxed my-2 bg-black/30 p-2 rounded border border-[#2a2620]">
                    {gu.effect_desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#2a2620] flex justify-between items-center font-sans">
                  <span className="text-[10px] text-[#8a8275]">Hunger: {gu.hunger}%</span>
                  <button
                    onClick={() => equipGu(gu.id)}
                    disabled={isLoading || !canEquipActive}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                      canEquipActive && !isLoading
                        ? 'bg-[#3b4d3c]/30 hover:bg-[#3b4d3c] border-[#3b4d3c] text-emerald-200 hover:text-white cursor-pointer shadow-md'
                        : 'bg-[#1a1814] border-[#2a2620] text-zinc-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {!canEquipActive ? 'Combat Slots Full (3/3)' : 'Equip to Aperture'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty Placeholder Slots in Vault */}
          {Array.from({ length: emptyVaultSlotsCount }).map((_, idx) => (
            <div 
              key={`empty_vault_${idx}`}
              className="bg-[#12100d]/40 border border-dashed border-[#2a2620] rounded-xl p-5 flex flex-col items-center justify-center min-h-[140px] text-center"
            >
              <span className="text-lg text-[#2a2620] mb-1">📭</span>
              <span className="text-[11px] text-[#8a8275] font-sans uppercase tracking-wider">
                Empty Vault Slot
              </span>
            </div>
          ))}
        </div>

        {vaultGu.length === 0 && (
          <div className="text-center text-[#8a8275] italic my-8 font-sans text-xs">
            Your Inactive Storage is empty. Unequip Gu from your Aperture or capture wild Gu to store them here!
          </div>
        )}
      </div>

    </div>
  );
}
