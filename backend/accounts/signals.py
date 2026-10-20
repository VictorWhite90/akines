from django.contrib.auth.signals import user_logged_out
from django.dispatch import receiver

from .models import UserSession


@receiver(user_logged_out)
def forget_device(sender, request, user, **kwargs):
    if request is not None and request.session.session_key:
        UserSession.objects.filter(session_key=request.session.session_key).delete()
