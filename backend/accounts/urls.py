from django.urls import path

from . import views

urlpatterns = [
    path("auth/csrf/", views.csrf),
    path("auth/request-code/", views.request_code),
    path("auth/verify-code/", views.verify_code),
    path("auth/me/", views.me),
    path("auth/sign-out/", views.sign_out),
]
