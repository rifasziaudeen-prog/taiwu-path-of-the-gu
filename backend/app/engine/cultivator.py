"""
Cultivator State & Aperture System (Reverend Insanity Lore Compliant)
Gu live inside the Primeval Aperture.
Only passive body-tempering Gu (e.g., Boar Gu, Bear Gu, Jade Skin Gu) nourish
and permanently/passively alter the cultivator's physical stats.
Active Gu (e.g., Moonlight Gu, Blood Frenzy Gu) are used in actions/battles consuming Primeval Essence.
"""

from typing import List, Dict, Any, Optional

class CultivatorState:
    def __init__(self):
        self.name: str = "Fang Yuan"
        self.rank: int = 1
        self.stage: str = "Peak Stage"
        self.aperture_grade: str = "A Grade (93% Primeval Sea)"
        self.aperture_status: str = "Pristine"  # "Pristine" or "Fractured"
        self.primeval_essence: int = 93
        self.max_essence: int = 93
        self.essence_type: str = "Dark Green Copper Primeval Essence"
        self.spirit_stones: int = 65
        self.player_pos: List[int] = [7, 7]  # [x, y]
        self.current_node: dict = None  # tracks the current explorable node
        
        # Base mortal attributes
        self.base_strength: int = 10
        self.base_defense: int = 5
        self.base_speed: int = 10
        self.current_hp: int = 100
        
        # Starting inventory inside the Primeval Aperture
        self.aperture: List[Dict[str, Any]] = [
            {
                "id": "gu_moonlight",
                "name": "Moonlight Gu",
                "tier": 1,
                "path": "Moon Path",
                "gu_type": "active",
                "hunger": 90,
                "food": "Moon Orchid Petals",
                "effect_desc": "Expels a curved moonblade from the palm (Deals 35 Moon damage). Costs 10% Essence.",
                "passive_buff": None,
                "active_power": 35,
                "essence_cost": 10
            },
            {
                "id": "gu_white_boar",
                "name": "White Boar Gu",
                "tier": 1,
                "path": "Strength Path",
                "gu_type": "passive_body",
                "hunger": 85,
                "food": "Boar Meat",
                "effect_desc": "Nourishes the body with the strength of one boar (+15 Strength). Passive while fed.",
                "passive_buff": {
                    "stat": "strength",
                    "value": 15,
                    "label": "1 Boar Strength"
                },
                "active_power": 0,
                "essence_cost": 0
            },
            {
                "id": "gu_jade_skin",
                "name": "Jade Skin Gu",
                "tier": 1,
                "path": "Transformation Path",
                "gu_type": "passive_body",
                "hunger": 70,
                "food": "Jade Stone Fragments",
                "effect_desc": "Tempers skin into lustrous jade (+20 Defense). Passive while fed.",
                "passive_buff": {
                    "stat": "defense",
                    "value": 20,
                    "label": "Jade Skin Armor"
                },
                "active_power": 0,
                "essence_cost": 0
            },
            {
                "id": "gu_liquor_worm",
                "name": "Liquor Worm",
                "tier": 1,
                "path": "Support Path",
                "gu_type": "passive_body",
                "hunger": 95,
                "food": "Fine Wine",
                "effect_desc": "Refines and purifies primeval essence by a minor realm (+10 Max Essence).",
                "passive_buff": {
                    "stat": "max_essence",
                    "value": 10,
                    "label": "Purified Essence Sea"
                },
                "active_power": 0,
                "essence_cost": 0
            },
            {
                "id": "gu_blood_frenzy",
                "name": "Blood Frenzy Gu",
                "tier": 2,
                "path": "Blood Path",
                "gu_type": "active",
                "hunger": 15,  # Starving!
                "food": "Fresh Warm Blood",
                "effect_desc": "Ignites blood sea to unleash terrifying devastation (Deals 80 Blood damage). Costs 25% Essence.",
                "passive_buff": None,
                "active_power": 80,
                "essence_cost": 25
            }
        ]

    def get_stats(self) -> Dict[str, Any]:
        """
        Calculates active total stats.
        Passive Gu only grant stats if their hunger is >= 20% (not starving).
        """
        total_strength = self.base_strength
        total_defense = self.base_defense
        bonus_essence = 0
        strength_modifiers = []
        defense_modifiers = []
        
        for gu in self.aperture:
            # Check if passive body Gu and fed
            if gu.get("gu_type") == "passive_body" and gu.get("hunger", 0) >= 20:
                buff = gu.get("passive_buff")
                if buff:
                    stat = buff.get("stat")
                    val = buff.get("value", 0)
                    label = buff.get("label", gu["name"])
                    
                    if stat == "strength":
                        total_strength += val
                        strength_modifiers.append(label)
                    elif stat == "defense":
                        total_defense += val
                        defense_modifiers.append(label)
                    elif stat == "max_essence":
                        bonus_essence += val

        max_essence = self.max_essence + bonus_essence
        # Clamp current essence to max
        current_essence = min(self.primeval_essence, max_essence)
        max_hp = total_defense * 10

        return {
            "name": self.name,
            "rank": self.rank,
            "stage": self.stage,
            "aperture_grade": self.aperture_grade,
            "aperture_status": self.aperture_status,
            "primeval_essence": current_essence,
            "max_essence": max_essence,
            "essence_type": self.essence_type,
            "spirit_stones": self.spirit_stones,
            "location": self.player_pos,
            "hp": self.current_hp,
            "max_hp": max_hp,
            "stats": {
                "strength": {
                    "total": total_strength,
                    "base": self.base_strength,
                    "modifiers": strength_modifiers
                },
                "defense": {
                    "total": total_defense,
                    "base": self.base_defense,
                    "modifiers": defense_modifiers
                },
                "speed": self.base_speed
            }
        }

    def attempt_ascension(self) -> Dict[str, Any]:
        """
        Lore-Accurate Mortal Breakthrough (Rank 1 -> 5):
        Mortals do NOT face Heavenly Tribulations.
        Breakthrough is strictly determined by battering the crystal wall with 90% essence.
        Success probability is strictly bounded by aperture_grade:
          A-Grade: 90%
          B-Grade: 60%
          C-Grade: 30%
          D-Grade: 10%
        If successful: Immediately rank up, reset to 'Initial Stage', and upgrade essence type.
        If failed: 15% chance of Aperture Fracture (permanently reducing max_essence by 5%).
        """
        import random
        
        # Check stage requirement
        if "Peak" not in self.stage:
            return {
                "success": False,
                "wall_broken": False,
                "message": f"Cannot ascend yet! You are currently at {self.stage}. Breakthrough to the next Rank requires reaching Peak Stage.",
                "cultivator": self.get_stats()
            }
            
        required_essence = int(self.max_essence * 0.9)
        if self.primeval_essence < required_essence:
            return {
                "success": False,
                "wall_broken": False,
                "message": f"Insufficient Primeval Essence! Battering the crystal wall requires at least 90% essence ({required_essence}%). Current: {self.primeval_essence}%.",
                "cultivator": self.get_stats()
            }
            
        # Instantly consume 90% essence in the battering attempt
        self.primeval_essence = max(0, self.primeval_essence - required_essence)
        
        # Calculate success chance strictly bounded by aperture grade
        grade = self.aperture_grade.upper()
        if "A" in grade:
            success_rate = 0.90
        elif "B" in grade:
            success_rate = 0.60
        elif "C" in grade:
            success_rate = 0.30
        elif "D" in grade:
            success_rate = 0.10
        else:
            success_rate = 0.40
            
        roll = random.random()
        if roll <= success_rate:
            # SUCCESS: Crystal wall breaks! Immediately rank up and reset stage to Initial Stage
            old_rank = self.rank
            self.rank += 1
            self.stage = "Initial Stage"
            
            # Upgrade essence type by Rank
            ESSENCE_TYPES = {
                1: "Dark Green Copper Primeval Essence",
                2: "Pale Red Iron Primeval Essence",
                3: "Light Silver Primeval Essence",
                4: "Bright Gold Primeval Essence",
                5: "Purple Crystal Primeval Essence",
                6: "Immortal Green Grape Essence"
            }
            self.essence_type = ESSENCE_TYPES.get(self.rank, f"Rank {self.rank} Primeval Essence")
            
            # Expand primeval sea capacity and fully replenish essence
            self.max_essence = int(self.max_essence * 1.25) + 10
            self.primeval_essence = self.max_essence
            
            # Mortal physique tempering from breakthrough
            self.base_strength += 15
            self.base_defense += 10
            self.base_speed += 5
            
            return {
                "success": True,
                "wall_broken": True,
                "message": f"✨ BREAKTHROUGH ACCOMPLISHED! The crystal wall shattered under your ferocious essence battering! You have ascended to Rank {self.rank} ({self.stage}) with {self.essence_type}!",
                "cultivator": self.get_stats()
            }
        else:
            # FAILURE: The wall held strong. Essence dissipated.
            # 15% chance of Aperture Fracture backlash
            fracture_roll = random.random()
            if fracture_roll <= 0.15:
                self.aperture_status = "Fractured"
                lost_cap = max(1, int(self.max_essence * 0.05))
                self.max_essence = max(10, self.max_essence - lost_cap)
                self.primeval_essence = min(self.primeval_essence, self.max_essence)
                return {
                    "success": False,
                    "wall_broken": False,
                    "fractured": True,
                    "message": f"💀 SEVERE BACKLASH! The aperture crystal wall resisted your essence onslaught. A hairline fracture cracked across your aperture wall! Max Essence permanently reduced by 5% (-{lost_cap}%). Status: FRACTURED.",
                    "cultivator": self.get_stats()
                }
            else:
                return {
                    "success": False,
                    "wall_broken": False,
                    "fractured": False,
                    "message": "💥 Breakthrough Failed! The crystal aperture wall resisted your onslaught. Your 90% primeval essence was depleted in vain.",
                    "cultivator": self.get_stats()
                }

    def apply_death_penalty(self) -> Dict[str, Any]:
        """
        Ruthless Gu World Death Penalty:
        - Teleport back to origin node [7, 7]
        - Deduct 50% Primeval Stones
        - Permanently destroy one equipped Gu worm from aperture
        """
        import random
        self.player_pos = [7, 7]
        lost_stones = self.spirit_stones // 2
        self.spirit_stones -= lost_stones
        
        lost_gu_name = None
        if len(self.aperture) > 0:
            destroyed_gu = random.choice(self.aperture)
            lost_gu_name = destroyed_gu["name"]
            self.aperture.remove(destroyed_gu)
            
        # Restore basic HP on revive
        self.current_hp = max(20, self.base_defense * 5)
        
        return {
            "success": True,
            "lost_stones": lost_stones,
            "lost_gu": lost_gu_name,
            "message": f"💀 MORTAL COLLAPSE! You fell in battle. Teleported to origin [7,7]. Plundered {lost_stones} Primeval Stones." + (f" Your Gu '{lost_gu_name}' was destroyed!" if lost_gu_name else ""),
            "cultivator": self.get_stats()
        }

# Global in-memory singleton for the prototype session
player_cultivator = CultivatorState()
