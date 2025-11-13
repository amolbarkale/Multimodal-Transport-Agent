from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from crud import path, stop as stop_crud
from schemas import PathCreate, PathResponse, StopResponse

router = APIRouter(prefix="/paths", tags=["paths"])


@router.post("/", response_model=PathResponse, status_code=status.HTTP_201_CREATED)
def create_path(path_data: PathCreate, db: Session = Depends(get_db)):
    # Validate that all stops exist
    for stop_data in path_data.stops:
        if not stop_crud.check_stop_exists(db, stop_data.stop_id):
            raise HTTPException(
                status_code=400, 
                detail=f"Stop with ID {stop_data.stop_id} does not exist"
            )
    
    return path.create_path(db, path_data)


@router.get("/", response_model=List[PathResponse])
def get_paths(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return path.get_paths(db, skip=skip, limit=limit)


@router.get("/all", response_model=List[PathResponse])
def get_all_paths(db: Session = Depends(get_db)):
    return path.get_all_paths(db)


@router.get("/search", response_model=List[PathResponse])
def search_paths(
    search_term: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return path.search_paths(db, search_term, skip, limit)


@router.get("/sorted", response_model=List[PathResponse])
def get_paths_sorted(
    ascending: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return path.get_paths_sorted_by_name(db, ascending, skip, limit)


@router.get("/by-stop/{stop_id}", response_model=List[PathResponse])
def get_paths_containing_stop(stop_id: int, db: Session = Depends(get_db)):
    if not stop_crud.check_stop_exists(db, stop_id):
        raise HTTPException(status_code=404, detail="Stop not found")
    return path.get_paths_containing_stop(db, stop_id)


@router.get("/by-stop-count", response_model=List[PathResponse])
def get_paths_by_stop_count(
    min_stops: Optional[int] = None,
    max_stops: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return path.get_paths_by_stop_count(db, min_stops, max_stops)


@router.get("/count")
def get_path_count(db: Session = Depends(get_db)):
    return {"count": path.get_path_count(db)}


@router.get("/{path_id}", response_model=PathResponse)
def get_path(path_id: int, db: Session = Depends(get_db)):
    db_path = path.get_path(db, path_id)
    if not db_path:
        raise HTTPException(status_code=404, detail="Path not found")
    return db_path


@router.get("/{path_id}/stops", response_model=List[StopResponse])
def get_path_stops(path_id: int, db: Session = Depends(get_db)):
    if not path.check_path_exists(db, path_id):
        raise HTTPException(status_code=404, detail="Path not found")
    
    path_stops = path.get_path_stops_ordered(db, path_id)
    # Return just the Stop objects in order
    return [stop_obj for _, stop_obj in path_stops]


@router.put("/{path_id}", response_model=PathResponse)
def update_path(
    path_id: int,
    path_data: PathCreate,
    db: Session = Depends(get_db)
):
    # Validate that all stops exist
    for stop_data in path_data.stops:
        if not stop_crud.check_stop_exists(db, stop_data.stop_id):
            raise HTTPException(
                status_code=400, 
                detail=f"Stop with ID {stop_data.stop_id} does not exist"
            )
    
    db_path = path.update_path(db, path_id, path_data)
    if not db_path:
        raise HTTPException(status_code=404, detail="Path not found")
    return db_path


@router.delete("/{path_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_path(path_id: int, db: Session = Depends(get_db)):
    if not path.delete_path(db, path_id):
        raise HTTPException(status_code=404, detail="Path not found")
    return None


@router.post("/{path_id}/stops")
def add_stop_to_path(
    path_id: int,
    stop_id: int,
    stop_order: int,
    db: Session = Depends(get_db)
):
    if not path.check_path_exists(db, path_id):
        raise HTTPException(status_code=404, detail="Path not found")
    
    if not stop_crud.check_stop_exists(db, stop_id):
        raise HTTPException(status_code=404, detail="Stop not found")
    
    path_stop = path.add_stop_to_path(db, path_id, stop_id, stop_order)
    if not path_stop:
        raise HTTPException(status_code=400, detail="Failed to add stop to path")
    
    return {"message": "Stop added to path successfully", "path_id": path_id, "stop_id": stop_id}


@router.delete("/{path_id}/stops/{stop_id}")
def remove_stop_from_path(
    path_id: int,
    stop_id: int,
    db: Session = Depends(get_db)
):
    if not path.remove_stop_from_path(db, path_id, stop_id):
        raise HTTPException(status_code=404, detail="Stop not found in path")
    
    return {"message": "Stop removed from path successfully", "path_id": path_id, "stop_id": stop_id}
