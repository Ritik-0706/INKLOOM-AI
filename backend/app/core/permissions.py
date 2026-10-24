from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    APPROVER = "approver"
    CREATOR = "creator"

ROLE_HIERARCHY = {
    UserRole.ADMIN: 4,
    UserRole.MANAGER: 3,
    UserRole.APPROVER: 2,
    UserRole.CREATOR: 1,
}

def has_minimum_role(user_role: str, required_role: UserRole) -> bool:
    user_level = ROLE_HIERARCHY.get(UserRole(user_role), 0)
    required_level = ROLE_HIERARCHY.get(required_role, 0)
    return user_level >= required_level

def can_approve(user_role: str) -> bool:
    return UserRole(user_role) in [UserRole.ADMIN, UserRole.MANAGER, UserRole.APPROVER]
