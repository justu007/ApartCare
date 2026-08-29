from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id','email', 'name', 'role', 'phone', 'is_active', 'is_staff', 'date_joined','community')

    list_filter = ('role', 'is_active', 'is_staff','community')

    search_fields = ('email', 'name', 'phone')

    ordering = ('email',)

    list_per_page = 25

    def role_colored(self, obj):
        return f"{obj.get_role_display()}" 
    
    role_colored.short_description = 'User Role'
