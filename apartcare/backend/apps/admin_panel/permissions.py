from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.role =='ADMIN'
        )
    
    
class IsResident(BasePermission):
    def has_permission(self, request, view):
        return(
            request.user.is_authenticated and request.user.role =='RESIDENT'
        )

class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return(
            request.user.is_authenticated and request.user.role =='STAFF'
        )