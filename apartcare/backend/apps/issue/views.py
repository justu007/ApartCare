from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Issue,IssueImage
from .serializers import IssueSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser


class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]


    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'ADMIN':
            return Issue.objects.all() 
            
        elif user.role == 'STAFF':
            return Issue.objects.filter(assigned_staff=user) 
            
        elif user.role == 'RESIDENT':
            return Issue.objects.filter(creator=user) 
            
        return Issue.objects.none()

    
    def create(self, request, *args, **kwargs):
        print(request.COOKIES)
        print(request.user)
        if request.user.role != 'RESIDENT':
            raise PermissionDenied("Only residents can raise an issue")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        issue = serializer.save(creator = request.user)


        images_data = request.FILES.getlist('images') 
        
        for image_data in images_data:
            IssueImage.objects.create(issue=issue, image=image_data)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    
    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True 
        instance = self.get_object()
        user = request.user
        
        
        data = request.data.copy()
        if user.role == 'RESIDENT':
            if instance.status != 'Open':
                 return Response({"error": "You cannot edit an issue once staff has been assigned."}, status=status.HTTP_403_FORBIDDEN)
            
            data.pop('status', None)
            data.pop('assigned_staff', None)
            data.pop('admin_notes', None)

        
        elif user.role == 'STAFF':
            allowed_statuses = ['In-Progress', 'Resolved']
            new_status = data.get('status')
            
            if new_status and new_status not in allowed_statuses:
                return Response({"error": f"Staff can only change status to: {allowed_statuses}"}, status=status.HTTP_400_BAD_REQUEST)
            
            
            data = {'status': new_status} if new_status else {}

        
        elif user.role == 'ADMIN':
            
            if 'assigned_staff' in data and instance.status == 'Open':
                data['status'] = 'Assigned'

        
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

