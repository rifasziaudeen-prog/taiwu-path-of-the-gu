"""
Overworld System - 5 Regions of Reverend Insanity's World
Each region has explorable Nodes (important locations).
Entering a Node drops the player into the 15x15 local tile grid explorer.
"""

from typing import List, Dict, Any, Optional

# 5 canonical regions from Reverend Insanity lore
OVERWORLD_REGIONS = {
    "central_continent": {
        "id": "central_continent",
        "name": "Central Continent",
        "chinese_name": "中土大陆",
        "desc": "The most powerful land under heaven. Home to the five peak Gu Immortals and the greatest clans. Mountains of ancient wisdom and rivers of primeval essence.",
        "position": {"x": 50, "y": 45},  # percent on world map
        "biome": "Mountain Fortress",
        "color": "#8B6914",
        "nodes": [
            {
                "id": "qing_mao_mountain",
                "name": "Qing Mao Mountain",
                "chinese_name": "青茂山",
                "desc": "A remote mountain within the Gu Yue Clan's territory. Rich in Gu worms and spiritual energy. Fang Yuan's starting ground.",
                "type": "starter",
                "region_id": 1,
                "position": {"x": 45, "y": 50},
                "dominant_biome": "Bamboo Forest",
                "unlocked": True
            },
            {
                "id": "gu_yue_clan",
                "name": "Gu Yue Clan",
                "chinese_name": "固岳氏族",
                "desc": "A medium-tier mortal clan with ancient roots. The Clan Elder rules with an iron fist. Refinement workshops and a clan treasury lie within.",
                "type": "sect",
                "region_id": 2,
                "position": {"x": 52, "y": 42},
                "dominant_biome": "Sect Grounds",
                "unlocked": True
            },
            {
                "id": "heavenly_court",
                "name": "Heavenly Court Ruins",
                "chinese_name": "天庭遗址",
                "desc": "Ancient shattered remains of Heavenly Court's outer walls. Immense primeval stone deposits lie buried. Extremely dangerous.",
                "type": "ruins",
                "region_id": 3,
                "position": {"x": 48, "y": 38},
                "dominant_biome": "Ancient Ruins",
                "unlocked": False
            }
        ]
    },
    "northern_plains": {
        "id": "northern_plains",
        "name": "Northern Plains",
        "chinese_name": "北疆平原",
        "desc": "Vast frozen steppes howling with bitter winds. The wolf clans and nomadic beast cultivators roam these lands. Strength rules above all.",
        "position": {"x": 50, "y": 15},
        "biome": "Frozen Tundra",
        "color": "#4A7FA5",
        "nodes": [
            {
                "id": "iron_wolf_camp",
                "name": "Iron Wolf Camp",
                "chinese_name": "铁狼营地",
                "desc": "A nomadic beast cultivator encampment. Wild strength Gu and wolf blood Gu are plentiful here.",
                "type": "camp",
                "region_id": 4,
                "position": {"x": 48, "y": 20},
                "dominant_biome": "Mountain Pass",
                "unlocked": False
            },
            {
                "id": "frost_spirit_vein",
                "name": "Frost Spirit Vein",
                "chinese_name": "霜灵脉",
                "desc": "A natural frozen primeval stone vein. Ice Gu and speed Gu are abundant near its surface.",
                "type": "resource",
                "region_id": 5,
                "position": {"x": 55, "y": 18},
                "dominant_biome": "Spirit Veins",
                "unlocked": False
            }
        ]
    },
    "southern_border": {
        "id": "southern_border",
        "name": "Southern Border",
        "chinese_name": "南疆",
        "desc": "Humid jungles thick with poison mist and ancient ruins. Demonic cultivators and poison path Gu masters make their home in these tangled wilds.",
        "position": {"x": 50, "y": 78},
        "biome": "Venom Jungle",
        "color": "#2D5A27",
        "nodes": [
            {
                "id": "venom_swamp_depths",
                "name": "Venom Swamp Depths",
                "chinese_name": "毒沼深处",
                "desc": "Fluorescent toxic marshes teeming with poisonous Gu. A deadly paradise for poison path cultivators.",
                "type": "wilderness",
                "region_id": 6,
                "position": {"x": 47, "y": 76},
                "dominant_biome": "Venom Swamp",
                "unlocked": False
            },
            {
                "id": "southern_ruins",
                "name": "Eerie Jungle Ruins",
                "chinese_name": "南疆古迹",
                "desc": "Vine-swallowed stone temples from an ancient Gu Master civilization. Wild Gu of forgotten dao marks roam these halls.",
                "type": "ruins",
                "region_id": 7,
                "position": {"x": 54, "y": 80},
                "dominant_biome": "Ancient Ruins",
                "unlocked": False
            }
        ]
    },
    "eastern_sea": {
        "id": "eastern_sea",
        "name": "Eastern Sea",
        "chinese_name": "东海",
        "desc": "Endless crashing seas with jagged island archipelagos. Sea path Gu Masters and mermen walk these coasts. The tides follow no mortal law.",
        "position": {"x": 82, "y": 45},
        "biome": "Coastal Cliffs",
        "color": "#1A4A6E",
        "nodes": [
            {
                "id": "jade_sea_island",
                "name": "Jade Sea Island",
                "chinese_name": "碧海岛",
                "desc": "A lush volcanic island with healing hot springs and rare sea Gu. Difficult to reach without a sea-walking Gu.",
                "type": "island",
                "region_id": 8,
                "position": {"x": 80, "y": 40},
                "dominant_biome": "Spirit Veins",
                "unlocked": False
            },
            {
                "id": "sea_cliff_cave",
                "name": "Sea Cliff Cave",
                "chinese_name": "海崖洞窟",
                "desc": "Vast caverns beneath the eastern cliffs, carved by centuries of crashing tides. Sea Gu inheritance lies within.",
                "type": "ruins",
                "region_id": 9,
                "position": {"x": 85, "y": 50},
                "dominant_biome": "Ancient Ruins",
                "unlocked": False
            }
        ]
    },
    "western_desert": {
        "id": "western_desert",
        "name": "Western Desert",
        "chinese_name": "西域荒漠",
        "desc": "Scorching endless dunes and eroded stone obelisks. A realm of desolation where only the strong survive the sun and sand. Sand path Gu thrive here.",
        "position": {"x": 18, "y": 45},
        "biome": "Sand Dunes",
        "color": "#8B6914",
        "nodes": [
            {
                "id": "ancient_obelisk_field",
                "name": "Ancient Obelisk Field",
                "chinese_name": "古碑阵",
                "desc": "Dozens of eroded stone pillars etched with forgotten Gu dao inscriptions. The desert wind howls with ghostly energy.",
                "type": "ruins",
                "region_id": 10,
                "position": {"x": 20, "y": 42},
                "dominant_biome": "Ancient Ruins",
                "unlocked": False
            },
            {
                "id": "sand_spirit_vein",
                "name": "Desert Spirit Vein",
                "chinese_name": "沙漠灵脉",
                "desc": "A partially buried primeval stone vein running beneath the western dunes. Sand path and earth path Gu are plentiful.",
                "type": "resource",
                "region_id": 11,
                "position": {"x": 15, "y": 50},
                "dominant_biome": "Spirit Veins",
                "unlocked": False
            }
        ]
    }
}

def get_all_regions() -> List[Dict[str, Any]]:
    regions = []
    for r in OVERWORLD_REGIONS.values():
        region_summary = {k: v for k, v in r.items() if k != "nodes"}
        region_summary["node_count"] = len(r["nodes"])
        regions.append(region_summary)
    return regions

def get_region_nodes(region_id: str) -> Optional[List[Dict[str, Any]]]:
    region = OVERWORLD_REGIONS.get(region_id)
    if not region:
        return None
    return region["nodes"]

def get_node(region_id: str, node_id: str) -> Optional[Dict[str, Any]]:
    region = OVERWORLD_REGIONS.get(region_id)
    if not region:
        return None
    return next((n for n in region["nodes"] if n["id"] == node_id), None)
