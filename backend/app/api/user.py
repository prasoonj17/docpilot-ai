from fastapi import APIRouter, Depends
from app.core.security import verify_token
from app.core.security import require_role
router = APIRouter(
    prefix="/user",
    tags=["User"]
)

@router.get("/me")
def get_me(
    current_user = Depends(verify_token)
):

    return current_user

@router.get("/admin")
def admin_dashboard(

    current_user=Depends(
        require_role("admin")
    )

):

    return {
        "message":"Welcome Admin"
    }


@router.get("/employee")
def employee_dashboard(

    current_user=Depends(
        require_role("employee")
    )

):

    return {
        "message":"Welcome Employee"
    }