from django.shortcuts import render
from .models import Bag, Bicycle, Scooter


def index(request):
    return render(request, "index.html")


def privacy(request):
    return render(request, "privacy.html")


def terms(request):
    return render(request, "terms.html")


def bag_list(request):
    """Sumkalar ijarasi sahifasi."""
    bags = Bag.objects.filter(faol=True)
    return render(request, "bags.html", {"bags": bags})


def bicycle_list(request):
    items = Bicycle.objects.filter(faol=True)
    return render(request, "bicycle.html", {"items": items})


def scooter_list(request):
    items = Scooter.objects.filter(faol=True)
    return render(request, "scooter.html", {"items": items})
