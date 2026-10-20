from django.urls import path

from . import views

urlpatterns = [
    path("auth/csrf/", views.CsrfView.as_view()),
    path("auth/start/", views.StartView.as_view()),
    path("auth/verify/", views.VerifyView.as_view()),
    path("auth/complete-signup/", views.CompleteSignupView.as_view()),
    path("auth/handle-available/", views.HandleAvailableView.as_view()),
    path("auth/sign-out/", views.SignOutView.as_view()),
    path("account/me/", views.MeView.as_view()),
    path("account/sessions/", views.SessionsView.as_view()),
    path("account/sessions/<int:pk>/", views.SessionDetailView.as_view()),
    path("account/contact/start/", views.ContactStartView.as_view()),
    path("account/contact/verify/", views.ContactVerifyView.as_view()),
    path("account/delete/start/", views.DeleteAccountStartView.as_view()),
    path("account/delete/confirm/", views.DeleteAccountConfirmView.as_view()),
]
