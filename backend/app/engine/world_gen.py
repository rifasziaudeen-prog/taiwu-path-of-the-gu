import random
from typing import List, Dict, Any, Optional

BIOMES = [
    "Bamboo Forest",
    "Venom Swamp",
    "Ancient Ruins",
    "Sect Grounds",
    "Spirit Veins",
    "Mountain Pass",
    "Blood Mountain"
]

def generate_region(region_id: int, width: int = 15, height: int = 15, player_start: List[int] = [7, 7]) -> List[Dict[str, Any]]:
    """
    Procedurally generates a grid of tiles for a region with consistent seed.
    Reveals tiles in a 3x3 radius around player_start by default.
    """
    tiles = []
    random.seed(region_id)
    
    dominant_biome = random.choice(BIOMES)
    
    px, py = player_start
    
    for y in range(height):
        for x in range(width):
            if (x, y) == (px, py):
                terrain = "Sect Grounds"
            elif random.random() < 0.65:
                terrain = dominant_biome
            else:
                terrain = random.choice(BIOMES)
                
            # Initial fog of war: reveal tiles within distance 1 of player start
            is_revealed = abs(x - px) <= 1 and abs(y - py) <= 1
            
            tile = {
                "x": x,
                "y": y,
                "type": terrain,
                "terrain": terrain,
                "is_revealed": is_revealed,
                "discovered": is_revealed
            }
            tiles.append(tile)
            
    return tiles

def generate_tile_encounter(terrain: str) -> Optional[Dict[str, Any]]:
    """
    Generates a context-rich Reverend Insanity style encounter based on terrain.
    """
    roll = random.random()
    if roll > 0.40:
        return None  # 60% peaceful exploration
        
    encounter_tables = {
        "Bamboo Forest": [
            {
                "type": "wild_gu",
                "title": "Wild Gu Nest Discovered",
                "desc": "Deep within the emerald green bamboo groves, a shimmering jade beetle is absorbing morning dew.",
                "action": "capture",
                "wild_gu": {
                    "name": "Bamboo Boar Gu",
                    "tier": 1,
                    "path": "Strength Path",
                    "gu_type": "passive_body",
                    "food": "Green Bamboo Shoots",
                    "effect_desc": "Nourishes muscles with resilient bamboo fiber and boar strength (+12 Strength).",
                    "passive_buff": {"stat": "strength", "value": 12, "label": "Bamboo Boar Vigor"}
                }
            },
            {
                "type": "resource",
                "title": "Natural Spirit Spring",
                "desc": "A crack in the mossy ground gushes with pure primeval dew. You harvest 15 Primeval Stones.",
                "reward_type": "spirit_stones",
                "amount": 15
            }
        ],
        "Mountain Pass": [
            {
                "type": "wild_gu",
                "title": "Ferocious Mountain Beast",
                "desc": "A furious White Bristle Mountain Boar charges at you! In its heart dwells a wild strength Gu!",
                "action": "capture",
                "wild_gu": {
                    "name": "Black Boar Gu",
                    "tier": 1,
                    "path": "Strength Path",
                    "gu_type": "passive_body",
                    "food": "Raw Pork",
                    "effect_desc": "Infuses the sinews with brute beast strength (+15 Strength).",
                    "passive_buff": {"stat": "strength", "value": 15, "label": "1 Boar Strength"}
                }
            },
            {
                "type": "combat",
                "title": "Rogue Demonic Cultivator",
                "desc": "A lone demonic cultivator in tattered black robes attempts an ambush to rob your Primeval Stones!",
                "enemy_name": "Demonic Rogue (Rank 1 Peak)",
                "enemy_hp": 60,
                "enemy_atk": 25,
                "reward_stones": 25
            }
        ],
        "Venom Swamp": [
            {
                "type": "wild_gu",
                "title": "Poisonous Mists",
                "desc": "Among the bubbling toxic quagmire, a fluorescent centipede coils upon a rotting stump.",
                "action": "capture",
                "wild_gu": {
                    "name": "Poison Dart Gu",
                    "tier": 1,
                    "path": "Poison Path",
                    "gu_type": "active",
                    "food": "Venomous Slime",
                    "effect_desc": "Fires a concentrated needle of corrosive green venom (Deals 45 Poison damage).",
                    "active_power": 45,
                    "essence_cost": 12
                }
            }
        ],
        "Ancient Ruins": [
            {
                "type": "wild_gu",
                "title": "Ancient Gu Master Inheritance",
                "desc": "Inside an eroded stone pavilion, an ancient jade talisman glows with faint defensive dao marks.",
                "action": "capture",
                "wild_gu": {
                    "name": "Brass Skin Gu",
                    "tier": 1,
                    "path": "Transformation Path",
                    "gu_type": "passive_body",
                    "food": "Brass Powder",
                    "effect_desc": "Hardens flesh into metallic bronze (+15 Defense).",
                    "passive_buff": {"stat": "defense", "value": 15, "label": "Brass Skin Armor"}
                }
            },
            {
                "type": "resource",
                "title": "Inheritance Stash",
                "desc": "You uncover a concealed compartment containing 30 ancient Primeval Stones.",
                "reward_type": "spirit_stones",
                "amount": 30
            }
        ],
        "Blood Mountain": [
            {
                "type": "combat",
                "title": "Crimson Wolf Ambush",
                "desc": "A savage blood-red wild wolf lunges from the crimson crags!",
                "enemy_name": "Blood Wolf Beast",
                "enemy_hp": 75,
                "enemy_atk": 30,
                "reward_stones": 20
            }
        ],
        "Sect Grounds": [
            {
                "type": "resource",
                "title": "Clan Monthly Stipend",
                "desc": "You visit the Clan Resource Pavilion and receive your Rank 1 Cultivator allowance.",
                "reward_type": "spirit_stones",
                "amount": 10
            }
        ],
        "Spirit Veins": [
            {
                "type": "resource",
                "title": "Exposed Spirit Vein Ore",
                "desc": "You mine raw primeval ore from the natural vein (+20 Primeval Stones).",
                "reward_type": "spirit_stones",
                "amount": 20
            }
        ]
    }
    
    options = encounter_tables.get(terrain, [
        {
            "type": "resource",
            "title": "Found Primeval Stones",
            "desc": "You scavenge several loose primeval stones hidden beneath the rocks.",
            "reward_type": "spirit_stones",
            "amount": 10
        }
    ])
    
    return random.choice(options)
