import argparse
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


def positive_integer(value):
    value = int(value)
    if value <= 0:
        raise argparse.ArgumentTypeError(f"Value must be positive")

    return value


class Command(BaseCommand):
    help = "Remove old model runs"

    def add_arguments(self, parser):
        parser.add_argument("model_name", help="Name of the model runs to remove")
        parser.add_argument(
            "keep-last-n", help="Keep the last N runs", type=positive_integer
        )
        parser.add_argument("-n", "--dry-run", help="Dry run", action="store_true")

    def handle(self, *args, **kwargs):
        try:
            weather_model = WeatherModel.objects.get(short_name=kwargs["model_name"])
        except WeatherModel.DoesNotExist:
            raise CommandError("Weather model {model_name} not found".format(**kwargs))

        weather_model_runs_to_keep = weather_model.weathermodelrun_set.order_by(
            "-reftime"
        )[0 : kwargs["keep-last-n"] :]
        weather_model_runs_to_del = weather_model.weathermodelrun_set.order_by(
            "-reftime"
        )[kwargs["keep-last-n"] :]

        for weather_model_run in weather_model_runs_to_keep:
            print(f"Keeping {weather_model_run}")

        for weather_model_run in weather_model_runs_to_del:
            if not kwargs["dry_run"]:
                print(f"Removing {weather_model_run}")
                weather_model_run.delete()
            else:
                print(f"Would remove {weather_model_run}")
