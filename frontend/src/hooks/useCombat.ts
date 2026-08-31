import { create } from 'zustand';
import { useCultivatorStore } from './useCultivator';

export interface Enemy {
  id: string;
  name: string;
  rank: number;
  hp: number;
  maxHp: number;
  atk: number;
  reward_stones: number;
}

export interface CombatLog {
  id: string;
  message: string;
  type: 'player_atk' | 'enemy_atk' | 'system' | 'loot';
}

interface CombatStore {
  isActive: boolean;
  playerHp: number;
  playerMaxHp: number;
  enemy: Enemy | null;
  logs: CombatLog[];
  loot: { stones: number; items?: any[] } | null;
  isProcessing: boolean;

  startCombat: (enemyName: string, enemyHp: number, enemyAtk: number, rewardStones: number) => void;
  executeAction: (actionType: 'strike' | 'gu' | 'flee', guId?: string, guName?: string, power?: number, cost?: number) => Promise<void>;
  endCombat: () => void;
}

const API_BASE = 'http://127.0.0.1:8001/api/v1/world';

export const useCombatStore = create<CombatStore>((set, get) => ({
  isActive: false,
  playerHp: 100,
  playerMaxHp: 100,
  enemy: null,
  logs: [],
  loot: null,
  isProcessing: false,

  startCombat: (enemyName, enemyHp, enemyAtk, rewardStones) => {
    const cultivator = useCultivatorStore.getState().cultivator;
    // Calculate HP based on Defense body tempering
    const maxHp = cultivator ? cultivator.stats.defense.total * 10 : 250;
    
    set({
      isActive: true,
      playerHp: maxHp,
      playerMaxHp: maxHp,
      enemy: {
        id: `enemy_${Date.now()}`,
        name: enemyName,
        rank: 1,
        hp: enemyHp,
        maxHp: enemyHp,
        atk: enemyAtk,
        reward_stones: rewardStones
      },
      logs: [{ 
        id: Date.now().toString(), 
        message: `⚔️ Engaged in mortal combat with ${enemyName}!`, 
        type: 'system' 
      }],
      loot: null,
      isProcessing: false
    });
  },

  executeAction: async (actionType, guId, guName, power, cost) => {
    const state = get();
    if (!state.enemy || state.isProcessing) return;

    set({ isProcessing: true });
    const logId = Date.now();

    // Optimistically update logs
    let actionLog = '';
    if (actionType === 'flee') actionLog = 'You attempt to flee the battlefield...';
    else if (actionType === 'strike') actionLog = 'You launch a basic martial strike!';
    else actionLog = `You activate ${guName}, consuming ${cost}% essence!`;

    set(s => ({ logs: [...s.logs, { id: `${logId}_1`, message: actionLog, type: 'player_atk' }] }));

    try {
      // 1. Dispatch action to hypothetical backend combat endpoint
      const res = await fetch(`${API_BASE}/combat/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          gu_id: guId,
          enemy_id: state.enemy.id
        })
      });

      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        // --- FALLBACK SIMULATION ---
        // Since the Python backend /combat/action endpoint isn't built yet, we simulate the contract here 
        // to ensure the UI is fully functional and testable immediately.
        await new Promise(resolve => setTimeout(resolve, 800)); // Artificial network delay
        
        const cultivatorStore = useCultivatorStore.getState();
        const cultivator = cultivatorStore.cultivator;
        
        let dmgDealt = 0;
        if (actionType === 'strike') {
          dmgDealt = Math.max(1, (cultivator?.stats.strength.total || 10) - (state.enemy.rank * 5));
        } else if (actionType === 'gu' && power && cost) {
          dmgDealt = power;
          // Optimistically drain essence locally
          if (cultivator) {
             useCultivatorStore.setState({ 
               cultivator: { ...cultivator, primeval_essence: Math.max(0, cultivator.primeval_essence - cost) }
             });
          }
        }
        
        const enemyRemHp = Math.max(0, state.enemy.hp - dmgDealt);
        const dmgTaken = enemyRemHp > 0 ? Math.max(1, state.enemy.atk - ((cultivator?.stats.defense.total || 10) / 2)) : 0;
        const playerRemHp = Math.max(0, state.playerHp - dmgTaken);
        
        data = {
          success: true,
          action_type: actionType,
          damage_dealt: dmgDealt,
          damage_taken: dmgTaken,
          enemy_hp: enemyRemHp,
          player_hp: playerRemHp,
          is_victory: enemyRemHp <= 0,
          is_defeat: playerRemHp <= 0,
          fled: actionType === 'flee' ? Math.random() > 0.5 : false,
          logs: [
            actionType !== 'flee' ? `Dealt ${dmgDealt} damage to ${state.enemy.name}.` : '',
            enemyRemHp > 0 && actionType !== 'flee' ? `${state.enemy.name} retaliated for ${dmgTaken} damage!` : ''
          ].filter(Boolean),
          loot: enemyRemHp <= 0 ? { stones: state.enemy.reward_stones } : null
        };
      }

      // 2. Parse Response and Update UI Reactively
      if (data.fled) {
        set(s => ({ 
          logs: [...s.logs, { id: `${logId}_flee`, message: '🏃 You successfully escaped the encounter!', type: 'system' }] 
        }));
        setTimeout(() => get().endCombat(), 1500);
        return;
      } else if (actionType === 'flee') {
        set(s => ({ 
          logs: [...s.logs, { id: `${logId}_flee_fail`, message: '❌ Escape failed! The enemy blocks your path.', type: 'system' }] 
        }));
      }

      if (actionType !== 'flee') {
        // Update HP pools
        set(s => ({
          playerHp: data.player_hp,
          enemy: s.enemy ? { ...s.enemy, hp: data.enemy_hp } : null,
          logs: [
            ...s.logs,
            { id: `${logId}_dmg`, message: `💥 Dealt ${data.damage_dealt} damage!`, type: 'player_atk' },
            ...(data.damage_taken > 0 ? [{ id: `${logId}_taken`, message: `🩸 Took ${data.damage_taken} damage from retaliation.`, type: 'enemy_atk' } as CombatLog] : [])
          ]
        }));
      }

      // Check combat resolution
      if (data.is_victory) {
        set(s => ({
          loot: data.loot,
          logs: [
            ...s.logs,
            { id: `${logId}_vic`, message: `🏆 VICTORY! Slain ${s.enemy?.name}.`, type: 'system' },
            ...(data.loot?.stones ? [{ id: `${logId}_loot`, message: `💎 Pillaged ${data.loot.stones} Primeval Stones.`, type: 'loot' } as CombatLog] : [])
          ]
        }));
        
        // Give actual rewards in global store
        const cultivator = useCultivatorStore.getState().cultivator;
        if (cultivator && data.loot?.stones) {
          useCultivatorStore.setState({
            cultivator: { ...cultivator, spirit_stones: cultivator.spirit_stones + data.loot.stones }
          });
        }
      } else if (data.is_defeat) {
        // Ruthless Mortality Death Penalty
        try {
          const penRes = await useCultivatorStore.getState().deathPenalty();
          set(s => ({
            logs: [
              ...s.logs,
              { id: `${logId}_def`, message: `💀 MORTAL COLLAPSE! Your physical body gave out on the battlefield...`, type: 'system' },
              { id: `${logId}_pen`, message: `🩸 ${penRes.message}`, type: 'enemy_atk' }
            ]
          }));
        } catch (err: any) {
          set(s => ({
            logs: [...s.logs, { id: `${logId}_def`, message: `💀 MORTAL COLLAPSE! Your consciousness fades...`, type: 'system' }]
          }));
        }
      }

    } catch (err: any) {
      set(s => ({ logs: [...s.logs, { id: `${logId}_err`, message: `⚠️ Combat Sync Error: ${err.message}`, type: 'system' }] }));
    } finally {
      set({ isProcessing: false });
    }
  },

  endCombat: () => {
    set({ isActive: false, enemy: null, loot: null });
  }
}));
