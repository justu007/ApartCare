# from django.contrib import admin
# from .models import Community,Block,Flat

# @admin.register(Community)
# class CommunityAdmin(admin.ModelAdmin):
#     # 1. THE TABLE COLUMNS (This is what you asked for!)
#     list_display = ('id', 'name', 'address')

#     # 2. FILTER SIDEBAR (To quickly find specific groups)
#     list_filter = ('name',)

#     # 3. SEARCH BAR (Search by email, name, or phone)
#     search_fields = ('name',)

#     # 4. DEFAULT SORTING (Order by email A-Z)
#     ordering = ('name',)

#     # 5. PAGINATION (Keep the page clean)
#     list_per_page = 10

#     # OPTIONAL: Make the Role colorful! 🎨
#     # This adds a small color indicator to the role column
#     def name_colored(self, obj):
#         return f"{obj.get_name_display()}" 
    
#     # If you want to customize the header name
#     name_colored.short_description = 'Community name'
# @admin.register(Block)
# class BlockAdmin(admin.ModelAdmin):
#     # 1. THE TABLE COLUMNS (This is what you asked for!)
#     list_display = ('id', 'name', 'community')

#     # 2. FILTER SIDEBAR (To quickly find specific groups)
#     list_filter = ('name',)

#     # 3. SEARCH BAR (Search by email, name, or phone)
#     search_fields = ('name',)

#     # 4. DEFAULT SORTING (Order by email A-Z)
#     ordering = ('name',)

#     # 5. PAGINATION (Keep the page clean)
#     list_per_page = 10


# @admin.register(Flat)
# class FlatAdmin(admin.ModelAdmin):
#     # 1. THE TABLE COLUMNS (This is what you asked for!)
#     list_display = ('id', 'name', 'block')

#     # 2. FILTER SIDEBAR (To quickly find specific groups)
#     list_filter = ('name',)

#     # 3. SEARCH BAR (Search by email, name, or phone)
#     search_fields = ('name',)

#     # 4. DEFAULT SORTING (Order by email A-Z)
#     ordering = ('name',)

#     # 5. PAGINATION (Keep the page clean)
#     list_per_page = 10   
from django.contrib import admin
from .models import Community, Block, Flat

@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'address', 'total_blocks') # Added a custom count column
    search_fields = ('name', 'address')
    ordering = ('name',)
    list_per_page = 20

    # Bonus: Show how many blocks are in this community directly in the table!
    def total_blocks(self, obj):
        return obj.blocks.count()
    total_blocks.short_description = 'Blocks Count'

@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'community')
    
    # 🔥 BETTER FILTER: Filter by Community, not Block Name
    list_filter = ('community',) 
    
    # 🔥 BETTER SEARCH: Search by Block Name OR Community Name
    search_fields = ('name', 'community__name') 
    
    ordering = ('community', 'name') # Group by community first, then name
    list_per_page = 20

    def total_flats(self, obj):
        return obj.flats.blocks.count()
    total_flats.short_description = 'Flats Count'

@admin.register(Flat)
class FlatAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'block', 'get_community')
    
    # 🔥 BETTER FILTER: Filter by Block (and consequently Community)
    list_filter = ('block__community', 'block') 
    
    # 🔥 POWER SEARCH: Search Flat No, Block Name, or Community Name
    search_fields = ('name', 'block__name', 'block__community__name')
    
    ordering = ('block', 'name')
    list_per_page = 20

    # Helper to show Community name in the Flat table
    def get_community(self, obj):
        return obj.block.community.name
    get_community.short_description = 'Community' # Sets column header