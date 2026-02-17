import json
from datetime import timezone
import shutil
import os

from django.core.management.base import BaseCommand, CommandError
from django.utils.dateparse import parse_datetime

from meteotiles.models import WeatherModel, WeatherModelRun, WeatherProductRun
from meteotiles.utils import (
    get_meteotiles_product_dir,
    get_arkimaps_product_forecast_reldir,
    get_meteotiles_product_forecast_dir,
    get_arkimaps_product_legend_relpath,
    get_meteotiles_legend_path,
)


class Command(BaseCommand):
    help = "Import arkimaps products"

    def add_arguments(self, parser):
        parser.add_argument('model_name', help="Name of the model associated to the products to import")
        parser.add_argument('products_directory', help="Input directory of the products")

    def handle(self, *args, **kwargs):
        try:
            weather_model = WeatherModel.objects.get(short_name=kwargs['model_name'])
        except WeatherModel.DoesNotExist:
            raise CommandError("Weather model {model_name} not found".format(**kwargs))

        new_products_directory = kwargs['products_directory']
        with open(f"{new_products_directory}/products.json") as fp:
            products_list = json.load(fp)

        for product in products_list:
            product_short_name = "{}_{}".format(product["recipe"]["name"], product["flavour"]["name"])
            product_long_name = product["recipe"]["description"]
            lat_min = product["flavour"]["lat_min"]
            lat_max = product["flavour"]["lat_max"]
            lon_min = product["flavour"]["lon_min"]
            lon_max = product["flavour"]["lon_max"]
            zoom_min = product["flavour"]["zoom_min"]
            zoom_max = product["flavour"]["zoom_max"]
            zindex = product["recipe"]["info"].get("zIndex")
            opacity = product["recipe"]["info"].get("opacity")

            for reftime_key, reftime_item in product["reftimes"].items():
                reftime = parse_datetime(reftime_key).replace(tzinfo=timezone.utc)
                weather_model_run, created = WeatherModelRun.objects.update_or_create(
                    weather_model=weather_model,
                    reftime=reftime,
                )

                forecast_steps = [int(step[:-1]) for step in reftime_item["steps"].keys()]
                legend_on = reftime_item["legend_info"] is not None and "legend_title" in reftime_item["legend_info"]

                try:
                    old_weather_product_run = WeatherProductRun.objects.get(
                        weather_model_run=weather_model_run,
                        short_name=product_short_name,
                    )
                    old_weather_product_run.delete()
                except WeatherProductRun.DoesNotExist:
                    pass

                weather_product_run = WeatherProductRun(
                    weather_model_run=weather_model_run,
                    short_name=product_short_name,
                    long_name=product_long_name,
                    forecast_steps=forecast_steps,
                    lat_min=lat_min,
                    lat_max=lat_max,
                    lon_min=lon_min,
                    lon_max=lon_max,
                    zoom_min=zoom_min,
                    zoom_max=zoom_max,
                    zindex=zindex,
                    opacity=opacity,
                    legend_on=legend_on,
                )
                weather_product_run.save()

                for forecast_step in forecast_steps:
                    input_fc_reldir = get_arkimaps_product_forecast_reldir(weather_product_run, forecast_step)
                    output_fc_dir = get_meteotiles_product_forecast_dir(weather_product_run, forecast_step)
                    shutil.copytree(
                        new_products_directory / input_fc_reldir,
                        output_fc_dir,
                    )

                if legend_on:
                    shutil.copy(
                        new_products_directory / get_arkimaps_product_legend_relpath(weather_product_run),
                        get_meteotiles_legend_path(weather_product_run),
                    )
