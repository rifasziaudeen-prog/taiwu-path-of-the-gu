from fastapi import APIRouter, HTTPException, Query, Request
from typing import List, Dict, Any, Optional
from app.engine.world_gen import generate_region, generate_tile_encounter
from app.engine.cultivator import player_cultivator
from app.engine.overworld import get_all_regions, get_region_nodes, get_node

router = APIRouter()

# In-memory region cache
region_cache: Dict[int, List[Dict[str, Any]]] = {}

# ─── Overworld endpoints (live via /api/v1/world/) ───────────────────────────

@router.get("/regions")
async def list_regions():
    """Returns all 5 overworld regions."""
    return {"status": "success", "regions": get_all_regions()}

@router.get("/regions/{region_id}/nodes")
async def list_nodes(region_id: str):
    """Returns explorable nodes within a given region."""
    nodes = get_region_nodes(region_id)
    if nodes is None:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found.")
    return {"status": "success", "region_id": region_id, "nodes": nodes}

@router.post("/regions/{region_id}/nodes/{node_id}/enter")
async def enter_node(region_id: str, node_id: str):
    """Enter an explorable node and load its 15x15 tile grid."""
    node = get_node(region_id, node_id)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    if not node.get("unlocked", False):
        raise HTTPException(status_code=403, detail=f"'{node['name']}' is sealed. Cultivate stronger to unlock.")
    
    grid_id = node["region_id"]
    tiles = get_or_create_region(grid_id)
    reveal_around(tiles, 7, 7)
    player_cultivator.player_pos = [7, 7]
    player_cultivator.current_node = {"node_id": node_id, "node_name": node["name"], "region_id": region_id, "grid_id": grid_id}

    return {
        "status": "success",
        "message": f"Entering {node['name']}...",
        "node": node,
        "tiles": tiles,
        "grid": tiles,
        "player_pos": player_cultivator.player_pos,
        "cultivator": player_cultivator.get_stats()
    }

@router.post("/exit")
async def exit_to_overworld():
    """Exit the current node and return to the overworld map."""
    player_cultivator.current_node = None
    return {"status": "success", "message": "Returned to overworld.", "regions": get_all_regions()}


def get_or_create_region(region_id: int) -> List[Dict[str, Any]]:
    if region_id not in region_cache:
        region_cache[region_id] = generate_region(
            region_id=region_id, 
            width=15, 
            height=15, 
            player_start=player_cultivator.player_pos
        )
    return region_cache[region_id]

def reveal_around(tiles: List[Dict[str, Any]], px: int, py: int, radius: int = 1):
    """Reveals tiles in radius around (px, py)."""
    for tile in tiles:
        if abs(tile["x"] - px) <= radius and abs(tile["y"] - py) <= radius:
            tile["is_revealed"] = True
            tile["discovered"] = True

@router.get("/region/{region_id}")
async def get_region(region_id: int):
    """
    Fetch the 15x15 region map.
    Returns both 'tiles' and 'grid' for frontend compatibility.
    """
    tiles = get_or_create_region(region_id)
    reveal_around(tiles, player_cultivator.player_pos[0], player_cultivator.player_pos[1])
    
    return {
        "region_id": region_id,
        "width": 15,
        "height": 15,
        "player_pos": player_cultivator.player_pos,
        "tiles": tiles,
        "grid": tiles,  # Alias to prevent frontend undefined errors
        "cultivator": player_cultivator.get_stats()
    }

@router.post("/move")
async def move_player(
    request: Request,
    dx: Optional[int] = Query(None),
    dy: Optional[int] = Query(None)
):
    """
    Moves player across the exploration grid.
    Supports both query parameters (?dx=0&dy=-1) and JSON body.
    """
    region_id = 1
    target_dx = dx
    target_dy = dy
    
    # Try parsing JSON body if query params not provided
    try:
        body = await request.json()
        if target_dx is None and "dx" in body:
            target_dx = body.get("dx")
        if target_dy is None and "dy" in body:
            target_dy = body.get("dy")
        if "to_x" in body and "to_y" in body:
            target_dx = body["to_x"] - player_cultivator.player_pos[0]
            target_dy = body["to_y"] - player_cultivator.player_pos[1]
        if "region_id" in body:
            region_id = body["region_id"]
    except Exception:
        pass
        
    if target_dx is None or target_dy is None:
        raise HTTPException(status_code=400, detail="Must provide movement delta dx and dy.")
        
    # Bound delta to max 1 step
    step_x = 1 if target_dx > 0 else (-1 if target_dx < 0 else 0)
    step_y = 1 if target_dy > 0 else (-1 if target_dy < 0 else 0)
    
    new_x = player_cultivator.player_pos[0] + step_x
    new_y = player_cultivator.player_pos[1] + step_y
    
    # Check boundaries (15x15)
    if new_x < 0 or new_x >= 15 or new_y < 0 or new_y >= 15:
        raise HTTPException(status_code=400, detail="Boundary of region reached.")
        
    player_cultivator.player_pos = [new_x, new_y]
    
    tiles = get_or_create_region(region_id)
    reveal_around(tiles, new_x, new_y)
    
    # Locate current tile
    current_tile = next((t for t in tiles if t["x"] == new_x and t["y"] == new_y), None)
    terrain = current_tile["type"] if current_tile else "Wilderness"
    
    # Generate encounter
    encounter = generate_tile_encounter(terrain)
    
    # If encounter has direct resource reward (spirit stones), auto add
    reward_msg = ""
    if encounter and encounter.get("type") == "resource":
        amt = encounter.get("amount", 10)
        player_cultivator.spirit_stones += amt
        reward_msg = f" (+{amt} Primeval Stones)"
        
    cultivator_stats = player_cultivator.get_stats()
    
    return {
        "success": True,
        "new_pos": [new_x, new_y],
        "player_pos": [new_x, new_y],
        "tile": {
            "x": new_x,
            "y": new_y,
            "type": terrain,
            "terrain": terrain
        },
        "event": encounter,
        "tiles": tiles,
        "grid": tiles,
        "cultivator": cultivator_stats
    }
