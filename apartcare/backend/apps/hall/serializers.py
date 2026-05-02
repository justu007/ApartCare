from rest_framework import serializers
from django.db.models import Q
from datetime import date
from .models import CommunityHall, HallBooking,HallImage
from django.core.exceptions import ObjectDoesNotExist

class HallImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HallImage
        fields = ['id', 'image']

class CommunityHallSerializer(serializers.ModelSerializer):
    images = HallImageSerializer(many=True, read_only=True)

    class Meta:
        model = CommunityHall
        fields = ['id', 'name', 'description', 'capacity', 'rent_per_seat', 'images', 'is_active']

class HallBookingSerializer(serializers.ModelSerializer):

    resident_name = serializers.CharField(source='resident.name', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    
    flat_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = HallBooking
        fields = [
            'id', 'hall', 'hall_name', 'resident_name', 'flat_name', 'purpose', 'booking_date', 'start_time', 
            'end_time', 'status', 'admin_remarks', 'created_at', 'attendees', 'total_amount', 'is_paid'
        ]
        read_only_fields = ['status', 'admin_remarks', 'created_at']

    def get_flat_name(self, obj):
        try:
            flat = obj.resident.resident_profile.flat
            return flat.name if flat else "N/A"
        except (ObjectDoesNotExist, AttributeError): 
            return "N/A"

    def validate(self, data):
        request = self.context.get('request')
        
        booking_date = data.get('booking_date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        hall = data.get('hall') 

        if booking_date and booking_date < date.today():
            raise serializers.ValidationError({"booking_date": "You cannot book for a past date."})
            
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({"end_time": "End time must be after start time."})

        if booking_date and start_time and end_time and hall and request:
            overlapping = HallBooking.objects.filter(
                community=request.user.community,
                hall=hall, 
                booking_date=booking_date,
                status__in=['APPROVED', 'PENDING'] 
            ).filter(
                Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
            )

            if overlapping.exists():
                raise serializers.ValidationError({"time_slot": f"This time slot is already booked or pending for {hall.name}."})

        return data

class AdminHallUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HallBooking
        fields = ['status', 'admin_remarks']

    def validate(self, data):
        new_status = data.get('status')
        if new_status == 'APPROVED' and self.instance:
            overlapping = HallBooking.objects.filter(
                community=self.instance.community,
                hall=self.instance.hall,
                booking_date=self.instance.booking_date,
                status='APPROVED'
            ).filter(
                Q(start_time__lt=self.instance.end_time) & Q(end_time__gt=self.instance.start_time)
            ).exclude(id=self.instance.id)

            if overlapping.exists():
                raise serializers.ValidationError("Cannot approve. This hall is already booked for this time.")
                
        return data