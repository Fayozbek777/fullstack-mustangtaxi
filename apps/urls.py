from django.urls import path
from . import views

app_name = "apps"

urlpatterns = [
    path("", views.index, name="home"),
    path("maxfiylik/", views.privacy, name="privacy"),
    path("foydalanish/", views.terms, name="terms"),
    path("bags/", views.bag_list, name="bags"),
    path("bicycles/", views.bicycle_list, name="bicycles"),
    path("scooters/", views.scooter_list, name="scooters"),
]
