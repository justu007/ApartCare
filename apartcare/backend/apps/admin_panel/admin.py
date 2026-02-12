from django.contrib import admin
from .models import AdminResident_Profile,StaffProfile

# Register your models here.
@admin.register(AdminResident_Profile)
class ResidentProfileAdmin(admin.ModelAdmin):
    # 1. WHAT TO SHOW
    list_display = ('user_email', 'get_name', 'flat', 'block', 'status', 'created_date')
    
    # 2. FILTERS (Sidebar)
    list_filter = ('status', 'block')
    
    # 3. SEARCH (The Magic Part ✨)
    # Allows searching by the connected User's email, name, or Flat number
    search_fields = ('user__email', 'user__name', 'flat__name', 'block__name')
    
    list_per_page = 10

    # Helper to show Email nicely
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'

    # Helper to show Name nicely
    def get_name(self, obj):
        return obj.user.name
    get_name.short_description = 'Full Name'

@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    # 1. WHAT TO SHOW
    list_display = ('user_email', 'designation', 'monthly_salary', 'status', 'joining_date')
    
    # 2. FILTERS (Sidebar)
    list_filter = ('status', 'designation', 'joining_date')
    
    # 3. SEARCH
    # Search by Staff email, name, or their job title
    search_fields = ('user__email', 'user__name', 'designation')
    
    # 4. EDITABLE (Edit salary directly in the list!)
    list_editable = ('status',) 
    
    list_per_page = 10

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'