from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Scooter, DrongoScooter, Bicycle, Bag, Car


# ============================================================
# FOYDALANUVCHILAR
# ============================================================
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "first_name",
        "last_name",
        "email",
        "telefon",
        "is_admin_panel",
        "is_staff",
    )
    list_filter = ("is_staff", "is_superuser", "is_admin_panel", "is_active")
    search_fields = ("username", "first_name", "last_name", "email", "telefon")

    fieldsets = UserAdmin.fieldsets + (
        ("Qo'shimcha ma'lumot", {"fields": ("telefon", "is_admin_panel")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Qo'shimcha ma'lumot", {"fields": ("telefon", "is_admin_panel")}),
    )


# ============================================================
# MIXIN — Narx va Zalog formatlash (500000 → 500.000)
# ============================================================
class NarxFormatMixin:
    """Narx va Zalog ni 500.000 ko'rinishida chiqaradi."""

    @admin.display(description="Narx (so'm)", ordering="narx")
    def format_narx(self, obj):
        """Narxni 500.000 formatda ko'rsatadi."""
        if obj.narx is None:
            return "—"
        return format_html(
            '<b style="color:#0a0a0a; font-size:14px;">{} so\'m</b>',
            f"{int(obj.narx):,}".replace(",", "."),
        )

    @admin.display(description="Zalog (so'm)", ordering="zalog")
    def format_zalog(self, obj):
        """Zalog ni 100.000 formatda ko'rsatadi."""
        if obj.zalog is None:
            return "—"
        return format_html(
            '<span style="color:#8d8d9a;">{} so\'m</span>',
            f"{int(obj.zalog):,}".replace(",", "."),
        )


# ============================================================
# UMUMIY ADMIN — barcha transportlar uchun
# ============================================================
class BaseTransportAdmin(NarxFormatMixin, admin.ModelAdmin):
    list_display = (
        "nomi",
        "kategoriya",
        "format_narx",
        "narx_turi",
        "tezlik",
        "batareya",
        "format_zalog",
        "faol",
    )
    list_filter = ("kategoriya", "narx_turi", "faol")
    search_fields = ("nomi", "kategoriya")

    fieldsets = (
        (
            "Asosiy ma'lumot",
            {
                "fields": (
                    ("nomi", "kategoriya"),
                    ("narx", "narx_turi"),
                    "tezlik",
                ),
                "description": "Narxni 500000 deb yozing — ro'yxatda avtomatik 500.000 ko'rinadi.",
            },
        ),
        (
            "Zalog shartlari",
            {
                "fields": ("zalog", "zalog_sharti"),
                "description": "Zalog default: 500.000 so'm",
            },
        ),
        (
            "Batareya",
            {
                "fields": ("batareya",),
            },
        ),
        (
            "📷 Rasmlar — URL yoki PC dan yuklang",
            {
                "fields": (
                    ("rasm_1_url", "rasm_1_fayl"),
                    ("rasm_2_url", "rasm_2_fayl"),
                    ("rasm_3_url", "rasm_3_fayl"),
                    ("rasm_4_url", "rasm_4_fayl"),
                    ("rasm_5_url", "rasm_5_fayl"),
                    ("rasm_6_url", "rasm_6_fayl"),
                ),
                "description": (
                    "Istalgan rasm uchun URL kiriting YOKI 'Choose File' orqali "
                    "kompyuteringizdan yuklang. Ikkalasi ham bo'lsa — fayl ustuvor."
                ),
            },
        ),
        (
            "🎁 Imtiyozlar",
            {
                "fields": ("imtiyoz_1", "imtiyoz_2", "imtiyoz_3", "imtiyoz_4"),
            },
        ),
        (
            "Holat",
            {
                "fields": ("faol",),
            },
        ),
    )


@admin.register(Scooter)
class ScooterAdmin(BaseTransportAdmin):
    pass


@admin.register(DrongoScooter)
class DrongoAdmin(BaseTransportAdmin):
    pass


@admin.register(Bicycle)
class BicycleAdmin(BaseTransportAdmin):
    pass


@admin.register(Car)
class CarAdmin(BaseTransportAdmin):
    pass


# ============================================================
# BAGS ADMIN
# ============================================================
@admin.register(Bag)
class BagAdmin(NarxFormatMixin, admin.ModelAdmin):
    list_display = (
        "nomi",
        "kategoriya",
        "format_narx",
        "narx_turi",
        "hajm",
        "format_zalog",
        "faol",
    )
    list_filter = ("kategoriya", "narx_turi", "faol")
    search_fields = ("nomi", "kategoriya")

    fieldsets = (
        (
            "Asosiy ma'lumot",
            {
                "fields": (
                    ("nomi", "kategoriya"),
                    ("narx", "narx_turi"),
                    "hajm",
                ),
                "description": "Narxni 50000 deb yozing — ro'yxatda avtomatik 50.000 ko'rinadi.",
            },
        ),
        (
            "Zalog shartlari",
            {
                "fields": ("zalog", "zalog_sharti"),
                "description": "Zalog default: 100.000 so'm",
            },
        ),
        (
            "📷 Rasmlar — URL yoki PC dan yuklang",
            {
                "fields": (
                    ("rasm_1_url", "rasm_1_fayl"),
                    ("rasm_2_url", "rasm_2_fayl"),
                    ("rasm_3_url", "rasm_3_fayl"),
                    ("rasm_4_url", "rasm_4_fayl"),
                ),
                "description": (
                    "Istalgan rasm uchun URL kiriting YOKI 'Choose File' orqali "
                    "kompyuteringizdan yuklang. Ikkalasi ham bo'lsa — fayl ustuvor."
                ),
            },
        ),
        (
            "🎁 Imtiyozlar",
            {
                "fields": ("imtiyoz_1", "imtiyoz_2", "imtiyoz_3", "imtiyoz_4"),
            },
        ),
        (
            "Holat",
            {
                "fields": ("faol",),
            },
        ),
    )


# ============================================================
# ADMIN PANEL SARLAVHASI
# ============================================================
admin.site.site_header = "Drongo Admin Panel"
admin.site.site_title = "Drongo Admin"
admin.site.index_title = "Boshqaruv paneli"
