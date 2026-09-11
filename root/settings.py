from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-541sdphpj#8x=g!159bo%$k#edy8n2yq77n$yx76e4k3si8lrg"

DEBUG = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


# ============================================================
# ILOVALAR
# ============================================================
INSTALLED_APPS = [
    "jazzmin",  # Admin panel dizayni (eng yuqorida turishi shart)
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "apps",  # ← bizning ilova
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ✅ Iframe uchun ruxsat
X_FRAME_OPTIONS = "SAMEORIGIN"

ROOT_URLCONF = "root.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "root.wsgi.application"


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ============================================================
# TIL VA VAQT
# ============================================================
LANGUAGE_CODE = "uz"
TIME_ZONE = "Asia/Tashkent"
USE_I18N = True
USE_TZ = True


# ============================================================
# STATIC & MEDIA
# ============================================================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# CUSTOM USER MODEL (muhim!)
# ============================================================
AUTH_USER_MODEL = "apps.User"


# ============================================================
# LOGIN SOZLAMALARI
# ============================================================
LOGIN_URL = "/admin/login/"
LOGIN_REDIRECT_URL = "/admin/"
LOGOUT_REDIRECT_URL = "/"


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ============================================================
# JAZZMIN — CHIROYLI ADMIN PANEL
# ============================================================
JAZZMIN_SETTINGS = {
    "site_title": "Drongo Admin",
    "site_header": "Drongo Boshqaruv Paneli",
    "site_brand": "DRONGO",
    "welcome_sign": "Drongo admin panelga xush kelibsiz!",
    "copyright": "Drongo © 2025",
    "search_model": ["apps.User", "apps.Scooter", "apps.Bag", "apps.Car"],
    "topmenu_links": [
        {
            "name": "Bosh sahifa",
            "url": "admin:index",
            "permissions": ["auth.view_user"],
        },
        {"name": "Saytga o'tish", "url": "/", "new_window": True},
    ],
    "show_sidebar": True,
    "navigation_expanded": True,
    "order_with_respect_to": [
        "apps",
        "apps.User",
        "apps.Scooter",
        "apps.DrongoScooter",
        "apps.Bicycle",
        "apps.Bag",
        "apps.Car",
        "auth",
        "auth.Group",
    ],
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "apps.User": "fas fa-user-shield",
        "apps.Scooter": "fas fa-motorcycle",
        "apps.DrongoScooter": "fas fa-bolt",
        "apps.Bicycle": "fas fa-bicycle",
        "apps.Bag": "fas fa-shopping-bag",
        "apps.Car": "fas fa-car",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    "related_modal_active": True,
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",
    "language_chooser": False,
}


JAZZMIN_UI_TWEAKS = {
    "changeform_format": "horizontal_tabs",
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": True,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
}
