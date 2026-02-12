from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # 1. THE TABLE COLUMNS (This is what you asked for!)
    list_display = ('id','email', 'name', 'role', 'phone', 'is_active', 'is_staff', 'date_joined')

    # 2. FILTER SIDEBAR (To quickly find specific groups)
    list_filter = ('role', 'is_active', 'is_staff')

    # 3. SEARCH BAR (Search by email, name, or phone)
    search_fields = ('email', 'name', 'phone')

    # 4. DEFAULT SORTING (Order by email A-Z)
    ordering = ('email',)

    # 5. PAGINATION (Keep the page clean)
    list_per_page = 25

    # OPTIONAL: Make the Role colorful! 🎨
    # This adds a small color indicator to the role column
    def role_colored(self, obj):
        return f"{obj.get_role_display()}" 
    
    # If you want to customize the header name
    role_colored.short_description = 'User Role'
