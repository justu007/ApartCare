from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 10  
    page_size_query_param = 'limit'  
    page_query_param = 'page' 

    def get_paginated_response(self, data):
        return Response({
            "total": self.page.paginator.count,
            "page": self.page.number,
            "limit": self.page.paginator.per_page,
            "data": data
        })