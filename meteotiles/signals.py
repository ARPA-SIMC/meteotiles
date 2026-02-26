import shutil

from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import WeatherProductRun, WeatherModelRun
from .utils import get_meteotiles_product_dir, get_meteotiles_run_dir


@receiver(post_delete, sender=WeatherProductRun)
def on_delete_weather_product_run(sender, instance, **kwargs):
    product_dir = get_meteotiles_product_dir(instance)
    if product_dir.exists():
        shutil.rmtree(product_dir)


@receiver(post_delete, sender=WeatherModelRun)
def on_delete_weather_model_run(sender, instance, **kwargs):
    run_dir = get_meteotiles_run_dir(instance)
    if run_dir.exists():
        shutil.rmtree(run_dir)
