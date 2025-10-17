from django.apps import AppConfig


class MeteotilesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "meteotiles"

    def ready(self):
        from . import signals
