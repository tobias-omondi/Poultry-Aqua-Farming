from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import RegisterSerializer, UserSerializer
from .models import CookieConsent


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    from django.contrib.auth import authenticate
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)

    cookie_path = '/api/auth/'
    cookie_samesite = 'Lax' if settings.DEBUG else 'None'
    cookie_secure = False if settings.DEBUG else True

    response = Response({
        'access': access,
        'user': UserSerializer(user).data,
    })

    # Set refresh token as HttpOnly cookie
    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        max_age=7 * 24 * 60 * 60,  # 7 days
        path=cookie_path,
    )

    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_view(request):
    refresh_token = request.COOKIES.get('refresh_token')

    if not refresh_token:
        return Response(
            {'error': 'No refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        refresh = RefreshToken(refresh_token)
        access = str(refresh.access_token)
        return Response({'access': access})
    except TokenError:
        return Response(
            {'error': 'Invalid or expired refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    cookie_path = '/api/auth/'
    cookie_samesite = 'Lax' if settings.DEBUG else 'None'

    response = Response({'message': 'Logged out'})
    response.delete_cookie('refresh_token', path=cookie_path, samesite=cookie_samesite)
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def cookie_consent_view(request):
    """
    Save cookie consent for logged-in or anonymous users.
    Called from the landing page banner.
    """
    import json

    data = request.data
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

    consent = data.get('consent')
    if consent not in ['accepted', 'essential', 'declined']:
        return Response(
            {'error': 'Invalid consent value. Use: accepted, essential, or declined'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get IP and user agent for audit trail
    ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
    if ',' in ip:
        ip = ip.split(',')[0].strip()
    user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]

    if request.user.is_authenticated:
        # Logged in user — attach to their account
        obj, created = CookieConsent.objects.update_or_create(
            user=request.user,
            defaults={
                'consent': consent,
                'ip_address': ip,
                'user_agent': user_agent,
            }
        )
    else:
        # Anonymous visitor — use session key
        if not request.session.session_key:
            request.session.create()
        obj, created = CookieConsent.objects.update_or_create(
            session_key=request.session.session_key,
            user=None,
            defaults={
                'consent': consent,
                'ip_address': ip,
                'user_agent': user_agent,
            }
        )

    return Response({
        'consent': obj.consent,
        'saved': True,
        'created': created,
        'timestamp': obj.updated_at,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def cookie_consent_status(request):
    """
    Check existing consent for current user or session.
    Called on page load to know if banner should show.
    """
    if request.user.is_authenticated:
        try:
            consent = request.user.cookie_consent
            return Response({
                'has_consent': True,
                'consent': consent.consent,
                'updated_at': consent.updated_at,
            })
        except CookieConsent.DoesNotExist:
            return Response({'has_consent': False})
    else:
        session_key = request.session.session_key
        if session_key:
            try:
                consent = CookieConsent.objects.get(session_key=session_key, user=None)
                return Response({
                    'has_consent': True,
                    'consent': consent.consent,
                    'updated_at': consent.updated_at,
                })
            except CookieConsent.DoesNotExist:
                pass
        return Response({'has_consent': False})
