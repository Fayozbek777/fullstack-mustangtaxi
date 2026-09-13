# ============================================================
#  Drongo Admin Panel — admin.py
# ============================================================

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from django.utils.translation import gettext_lazy as _
from .models import VideoReview


from .models import User, Scooter, DrongoScooter, Bicycle, Bag, Car

# ============================================================
#  НАСТРОЙКИ ПАНЕЛИ
# ============================================================
admin.site.site_header = "Drongo Admin Panel"
admin.site.site_title = "Drongo Admin"
admin.site.index_title = "Boshqaruv paneli"


# ============================================================
#  FOYDALANUVCHILAR
# ============================================================
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "full_name",
        "email",
        "telefon",
        "is_admin_panel",
        "is_staff",
        "is_active",
    )
    list_filter = ("is_staff", "is_superuser", "is_admin_panel", "is_active")
    search_fields = ("username", "first_name", "last_name", "email", "telefon")
    list_per_page = 30
    ordering = ("username",)

    fieldsets = UserAdmin.fieldsets + (
        ("Qo'shimcha ma'lumot", {"fields": ("telefon", "is_admin_panel")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Qo'shimcha ma'lumot", {"fields": ("telefon", "is_admin_panel")}),
    )

    @admin.display(description="F.I.Sh.", ordering="first_name")
    def full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name or "—"


# ============================================================
#  MIXIN — форматирование сумм (500000 → 500.000 so'm)
# ============================================================
class MoneyFormatMixin:
    """Единое форматирование narx и zalog."""

    @staticmethod
    def _fmt(value):
        return f"{int(value):,}".replace(",", ".")

    @admin.display(description="Narx (so'm)", ordering="narx")
    def format_narx(self, obj):
        if obj.narx is None:
            return "—"
        return format_html(
            '<b style="color:#0a0a0a; font-size:14px;">{} so\'m</b>',
            self._fmt(obj.narx),
        )

    @admin.display(description="Zalog (so'm)", ordering="zalog")
    def format_zalog(self, obj):
        if obj.zalog is None:
            return "—"
        return format_html(
            '<span style="color:#8d8d9a;">{} so\'m</span>',
            self._fmt(obj.zalog),
        )


# ============================================================
#  MIXIN — превью изображений
# ============================================================
class ImagePreviewMixin:
    """Показывает миниатюры всех картинок в форме редактирования."""

    @admin.display(description="Yuklangan rasmlar")
    def rasm_preview(self, obj):
        if not obj or not obj.pk:
            return "—"

        urls = []
        for i in range(1, 7):
            url = getattr(obj, f"rasm_{i}_url", None)
            fayl = getattr(obj, f"rasm_{i}_fayl", None)
            src = fayl.url if fayl else url
            if src:
                urls.append(
                    f'<img src="{src}" '
                    'style="height:90px;width:90px;object-fit:cover;'
                    'border-radius:8px;margin:4px;border:1px solid #ddd;" />'
                )

        if not urls:
            return "Rasm yuklanmagan"
        return mark_safe("".join(urls))


# ============================================================
#  БАЗОВЫЙ ADMIN ДЛЯ ТРАНСПОРТА
# ============================================================
class BaseTransportAdmin(MoneyFormatMixin, ImagePreviewMixin, admin.ModelAdmin):
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
    list_editable = ("faol",)
    search_fields = ("nomi", "kategoriya")
    ordering = ("-id",)
    list_per_page = 25
    save_on_top = True
    list_select_related = False

    readonly_fields = ("rasm_preview",)

    fieldsets = (
        (
            "🛴 Asosiy ma'lumot",
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
            "💰 Zalog shartlari",
            {
                "fields": ("zalog", "zalog_sharti"),
                "description": "Zalog default: 500.000 so'm",
            },
        ),
        (
            "🔋 Batareya",
            {"fields": ("batareya",)},
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
                    "rasm_preview",
                ),
                "description": (
                    "Istalgan rasm uchun URL kiriting YOKI 'Choose File' orqali "
                    "kompyuteringizdan yuklang. Ikkalasi ham bo'lsa — fayl ustuvor."
                ),
            },
        ),
        (
            "🎁 Imtiyozlar",
            {"fields": ("imtiyoz_1", "imtiyoz_2", "imtiyoz_3", "imtiyoz_4")},
        ),
        (
            "⚙️ Holat",
            {"fields": ("faol",)},
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
#  BAGS ADMIN
# ============================================================
@admin.register(Bag)
class BagAdmin(MoneyFormatMixin, ImagePreviewMixin, admin.ModelAdmin):
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
    list_editable = ("faol",)
    search_fields = ("nomi", "kategoriya")
    ordering = ("-id",)
    list_per_page = 25
    save_on_top = True

    readonly_fields = ("rasm_preview",)

    fieldsets = (
        (
            "🎒 Asosiy ma'lumot",
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
            "💰 Zalog shartlari",
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
                    "rasm_preview",
                ),
                "description": (
                    "Istalgan rasm uchun URL kiriting YOKI 'Choose File' orqali "
                    "kompyuteringizdan yuklang. Ikkalasi ham bo'lsa — fayl ustuvor."
                ),
            },
        ),
        (
            "🎁 Imtiyozlar",
            {"fields": ("imtiyoz_1", "imtiyoz_2", "imtiyoz_3", "imtiyoz_4")},
        ),
        (
            "⚙️ Holat",
            {"fields": ("faol",)},
        ),
    )


@admin.register(VideoReview)
class VideoReviewAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "role",
        "is_verified",
        "is_active",
        "order",
        "preview_video",
    )
    list_editable = ("is_verified", "is_active", "order")
    list_filter = ("is_verified", "is_active")
    search_fields = ("name", "role")
    ordering = ("order", "-created_at")
    list_per_page = 20

    fieldsets = (
        (_("Основное"), {"fields": ("name", "role")}),
        (_("Медиа"), {"fields": ("video", "poster")}),
        (_("Отображение"), {"fields": ("is_verified", "is_active", "order")}),
    )

    @admin.display(description=_("Превью"))
    def preview_video(self, obj):
        if not obj.video:
            return "—"
        return format_html(
            '<video src="{}" width="80" height="120" muted playsinline '
            'style="border-radius:8px;object-fit:cover;"></video>',
            obj.video.url,
        )
