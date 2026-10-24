from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.comment import ContentComment
from app.models.content import ContentItem
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/content/{content_id}/comments", response_model=List[CommentResponse])
def get_comments(
    content_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.organization_id == current_user.organization_id
    ).first()
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")

    comments = db.query(ContentComment).filter(
        ContentComment.content_id == content_id
    ).order_by(ContentComment.created_at.asc()).all()

    results = []
    for c in comments:
        author = db.query(User).filter(User.id == c.user_id).first() if c.user_id else None
        results.append(CommentResponse(
            id=c.id,
            content_id=c.content_id,
            user_id=c.user_id,
            user_name=author.full_name if author else "Team Member",
            user_avatar=author.avatar_url if author else None,
            user_role=author.role if author else None,
            message=c.message,
            parent_id=c.parent_id,
            created_at=c.created_at
        ))
    return results

@router.post("/content/{content_id}/comments", response_model=CommentResponse)
def add_comment(
    content_id: str,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(ContentItem).filter(
        ContentItem.id == content_id,
        ContentItem.organization_id == current_user.organization_id
    ).first()
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")

    c = ContentComment(
        content_id=content_id,
        user_id=current_user.id,
        message=comment_in.message,
        parent_id=comment_in.parent_id
    )
    db.add(c)
    db.commit()
    db.refresh(c)

    return CommentResponse(
        id=c.id,
        content_id=c.content_id,
        user_id=c.user_id,
        user_name=current_user.full_name,
        user_avatar=current_user.avatar_url,
        user_role=current_user.role,
        message=c.message,
        parent_id=c.parent_id,
        created_at=c.created_at
    )
