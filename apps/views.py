from django.shortcuts import render
from .models import Bag, Bicycle, Scooter, VideoReview, Car


def index(request):
    return render(request, "index.html")


def privacy(request):
    return render(request, "privacy.html")


def terms(request):
    return render(request, "terms.html")


def bag_list(request):
    bags = Bag.objects.filter(faol=True)
    return render(request, "bags.html", {"bags": bags})


def bicycle_list(request):
    items = Bicycle.objects.filter(faol=True)
    return render(request, "bicycle.html", {"items": items})


def car_list(request):
    cars = Car.objects.filter(faol=True)
    return render(request, "cars.html", {"cars": cars})


def scooter_list(request):
    items = Scooter.objects.filter(faol=True)
    return render(request, "scooter.html", {"items": items})


def proof_view(request):
    reviews = VideoReview.objects.filter(is_active=True)
    return render(request, "proof.html", {"reviews": reviews})
