from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['full_name', 'phone', 'role', 'farm_name',]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(required=False)
    farm_name = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name', 'farm_name', 'phone']

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        farm_name = validated_data.pop('farm_name', '')
        phone = validated_data.pop('phone', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )

        user.profile.full_name = full_name
        user.profile.farm_name = farm_name
        user.profile.phone = phone
        user.profile.save()

        return user