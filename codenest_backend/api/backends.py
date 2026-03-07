from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

UserModel = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
            
        print(f"DEBUG: Authenticating user '{username}' (Type: {type(username)})")
        print(f"DEBUG: kwargs: {kwargs}")
        
        if not username:
            return None
            
        try:
            # Check if the username is an email or a username
            user = UserModel.objects.filter(
                Q(username__iexact=username) | Q(email__iexact=username)
            ).order_by('id').first()
            
            if user:
                print(f"DEBUG: User found: {user.username}")
                if user.check_password(password):
                    print("DEBUG: Password correct")
                else:
                    print("DEBUG: Password INCORRECT")
            else:
                 print("DEBUG: User NOT found")

        except UserModel.DoesNotExist:
            return None

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
