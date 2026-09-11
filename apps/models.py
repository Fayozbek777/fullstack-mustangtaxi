from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator


class User(AbstractUser):
    telefon = models.CharField("Telefon raqam", max_length=20, blank=True)
    is_admin_panel = models.BooleanField("Admin panelga kirish", default=False)

    class Meta:
        verbose_name = "Foydalanuvchi"
        verbose_name_plural = "Foydalanuvchilar"

    def __str__(self):
        return self.username


class BaseTransport(models.Model):
    NARX_TURI = [
        ("kun", "Kunlik"),
        ("oy", "Oylik"),
        ("yil", "Yillik"),
    ]

    nomi = models.CharField("Nomi", max_length=200)
    kategoriya = models.CharField("Kategoriya", max_length=100)
    narx = models.DecimalField(
        "Narx (so'm)",
        max_digits=12,
        decimal_places=0,
        validators=[MinValueValidator(0)],
    )
    narx_turi = models.CharField(
        "Narx turi", max_length=10, choices=NARX_TURI, default="kun"
    )
    tezlik = models.PositiveIntegerField("Tezlik (km/soat)", default=25)

    zalog = models.DecimalField(
        "Zalog (so'm)", max_digits=12, decimal_places=0, default=500000
    )
    zalog_sharti = models.CharField(
        "Zalog sharti", max_length=200, default="Pasport siz yoki Pasport bilan"
    )

    batareya = models.PositiveIntegerField("Batareya quvvati (mAh)", default=10000)

    # 6 tagacha rasm (URL)
    rasm_1_url = models.URLField("Rasm 1 (URL)", blank=True)
    rasm_2_url = models.URLField("Rasm 2 (URL)", blank=True)
    rasm_3_url = models.URLField("Rasm 3 (URL)", blank=True)
    rasm_4_url = models.URLField("Rasm 4 (URL)", blank=True)
    rasm_5_url = models.URLField("Rasm 5 (URL)", blank=True)
    rasm_6_url = models.URLField("Rasm 6 (URL)", blank=True)

    # 6 tagacha rasm (fayl)
    rasm_1_fayl = models.ImageField(
        "Rasm 1 (PC dan)", upload_to="transport/", blank=True, null=True
    )
    rasm_2_fayl = models.ImageField(
        "Rasm 2 (PC dan)", upload_to="transport/", blank=True, null=True
    )
    rasm_3_fayl = models.ImageField(
        "Rasm 3 (PC dan)", upload_to="transport/", blank=True, null=True
    )
    rasm_4_fayl = models.ImageField(
        "Rasm 4 (PC dan)", upload_to="transport/", blank=True, null=True
    )
    rasm_5_fayl = models.ImageField(
        "Rasm 5 (PC dan)", upload_to="transport/", blank=True, null=True
    )
    rasm_6_fayl = models.ImageField(
        "Rasm 6 (PC dan)", upload_to="transport/", blank=True, null=True
    )

    imtiyoz_1 = models.CharField(
        "Imtiyoz 1", max_length=200, default="Dubulg'a to'plamda"
    )
    imtiyoz_2 = models.CharField(
        "Imtiyoz 2", max_length=200, default="Quvvatlantirish qurilmasi"
    )
    imtiyoz_3 = models.CharField(
        "Imtiyoz 3", max_length=200, default="Telefon ushlagichi"
    )
    imtiyoz_4 = models.CharField(
        "Imtiyoz 4", max_length=200, default="Bepul ta'mirlash"
    )

    faol = models.BooleanField("Faol", default=True)
    yaratilgan = models.DateTimeField("Yaratilgan vaqt", auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ["-yaratilgan"]


class Scooter(BaseTransport):
    class Meta:
        verbose_name = "Scooter"
        verbose_name_plural = "Scooters"

    def __str__(self):
        return f"{self.nomi} — {self.narx} so'm/{self.narx_turi}"


class DrongoScooter(BaseTransport):
    class Meta:
        verbose_name = "Drongo Scooter"
        verbose_name_plural = "Drongo Scooters"

    def __str__(self):
        return self.nomi


class Bicycle(BaseTransport):
    class Meta:
        verbose_name = "Bicycle"
        verbose_name_plural = "Bicycles"

    def __str__(self):
        return self.nomi


class Bag(models.Model):
    NARX_TURI = [("kun", "Kunlik"), ("oy", "Oylik"), ("yil", "Yillik")]

    nomi = models.CharField("Nomi", max_length=200)
    kategoriya = models.CharField(
        "Kategoriya", max_length=100, default="Yetkazib berish sumkasi"
    )
    narx = models.DecimalField(
        "Narx (so'm)",
        max_digits=12,
        decimal_places=0,
        validators=[MinValueValidator(0)],
    )
    narx_turi = models.CharField(
        "Narx turi", max_length=10, choices=NARX_TURI, default="kun"
    )
    hajm = models.CharField("Hajmi", max_length=100, default="50L")

    zalog = models.DecimalField(
        "Zalog (so'm)", max_digits=12, decimal_places=0, default=100000
    )
    zalog_sharti = models.CharField(
        "Zalog sharti", max_length=200, default="Pasport siz yoki Pasport bilan"
    )

    rasm_1_url = models.URLField("Rasm 1 (URL)", blank=True)
    rasm_2_url = models.URLField("Rasm 2 (URL)", blank=True)
    rasm_3_url = models.URLField("Rasm 3 (URL)", blank=True)
    rasm_4_url = models.URLField("Rasm 4 (URL)", blank=True)

    rasm_1_fayl = models.ImageField(
        "Rasm 1 (PC dan)", upload_to="bags/", blank=True, null=True
    )
    rasm_2_fayl = models.ImageField(
        "Rasm 2 (PC dan)", upload_to="bags/", blank=True, null=True
    )
    rasm_3_fayl = models.ImageField(
        "Rasm 3 (PC dan)", upload_to="bags/", blank=True, null=True
    )
    rasm_4_fayl = models.ImageField(
        "Rasm 4 (PC dan)", upload_to="bags/", blank=True, null=True
    )

    imtiyoz_1 = models.CharField(
        "Imtiyoz 1", max_length=200, default="Suv o'tkazmaydigan material"
    )
    imtiyoz_2 = models.CharField(
        "Imtiyoz 2", max_length=200, default="Telefon ushlagichi"
    )
    imtiyoz_3 = models.CharField(
        "Imtiyoz 3", max_length=200, default="Bepul ta'mirlash"
    )
    imtiyoz_4 = models.CharField(
        "Imtiyoz 4", max_length=200, default="Yorqin aks ettiruvchi lenta"
    )

    faol = models.BooleanField("Faol", default=True)
    yaratilgan = models.DateTimeField("Yaratilgan vaqt", auto_now_add=True)

    class Meta:
        verbose_name = "Bag"
        verbose_name_plural = "Bags"
        ordering = ["-yaratilgan"]

    def __str__(self):
        return f"{self.nomi} — {self.hajm}"


class Car(BaseTransport):
    class Meta:
        verbose_name = "Car"
        verbose_name_plural = "Cars"

    def __str__(self):
        return self.nomi
