from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from chickens.models import Batch, DailyLog, Harvest
from inventory.models import Supplier, Medication, FeedStock, PurchaseOrder, PriceHistory
from housing.models import House


class FarmListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        farmer_info = {
            "farmer_id": user.id,
            "farmer_username": user.username,
            "farmer_email": user.email,
            "farmer_full_name": getattr(profile, 'full_name', '') if profile else '',
            "farmer_phone": getattr(profile, 'phone', '') if profile else '',
            "farmer_role": getattr(profile, 'role', '') if profile else '',
            "farm_name": getattr(profile, 'farm_name', '') if profile else '',
        }

        batches = Batch.objects.filter(user=user)
        daily_logs = DailyLog.objects.filter(batch__user=user)
        harvests = Harvest.objects.filter(batch__user=user)
        houses = House.objects.filter(active_batch__user=user)

        context = {
            'farmer': farmer_info,
            'batches': list(batches.values(
                'id', 'name', 'breed', 'initial_count', 'current_count', 'status', 'start_date', 'end_date'
            )),
            'daily_logs': list(daily_logs.values(
                'id', 'batch', 'date', 'feed_consumed_kg', 'deaths', 'average_weight_kg', 'notes'
            )),
            'harvests': list(harvests.values(
                'id', 'batch', 'date', 'birds_sold', 'total_weight_kg', 'price_per_kg', 'buyer_name'
            )),
            'suppliers': list(Supplier.objects.filter(user=user).values('id', 'name', 'phone', 'email', 'location', 'category')),
            'medications': list(Medication.objects.filter(user=user).values('id', 'name', 'quantity', 'unit', 'expiry_date')),
            'feed_stock': list(FeedStock.objects.filter(user=user).values('id', 'feed_type', 'brand', 'quantity_bags', 'kg_per_bag', 'last_restocked')),
            'purchase_orders': list(PurchaseOrder.objects.filter(user=user).values('id', 'item_type', 'item_name', 'quantity', 'unit', 'supplier', 'status', 'date_purchased')),
            'price_history': list(PriceHistory.objects.filter(user=user).values('id', 'supplier', 'item_name', 'price_per_unit', 'date')),
            'houses': list(houses.values('id', 'name', 'capacity', 'active_batch', 'last_cleaned')),
        }

        return Response(context, status=status.HTTP_200_OK)