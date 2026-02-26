from pathlib import Path
from datetime import timedelta

from django.conf import settings

from .models import WeatherProductRun, WeatherModelRun


def get_meteotiles_run_dir(weather_model_run: WeatherModelRun) -> Path:
    return Path(settings.METEOTILES_BASEDIR) / get_meteotiles_run_reldir(weather_model_run)


def get_meteotiles_run_reldir(weather_model_run: WeatherModelRun) -> Path:
    return Path(
        weather_model_run.weather_model.short_name,
        weather_model_run.reftime.strftime("%Y%m%d%H%M%S"),
    )


def get_meteotiles_product_reldir(weather_product_run: WeatherProductRun) -> Path:
    return get_meteotiles_run_reldir(weather_product_run.weather_model_run) / Path(
        weather_product_run.short_name,
    )


def get_meteotiles_product_dir(weather_product_run: WeatherProductRun) -> Path:
    return Path(settings.METEOTILES_BASEDIR) / get_meteotiles_product_reldir(
        weather_product_run
    )


def get_meteotiles_product_forecast_reldir(weather_product_run, forecast_step):
    return get_meteotiles_product_reldir(weather_product_run) / (
        weather_product_run.weather_model_run.reftime + timedelta(hours=forecast_step)
    ).strftime("%Y%m%d%H%M%S")


def get_meteotiles_product_forecast_dir(
    weather_product_run: WeatherProductRun, forecast_step: int
) -> Path:
    return Path(settings.METEOTILES_BASEDIR) / get_meteotiles_product_forecast_reldir(
        weather_product_run, forecast_step
    )


def get_meteotiles_legend_relpath(weather_product_run: WeatherProductRun) -> Path:
    return get_meteotiles_product_reldir(weather_product_run) / Path(f"legend.png")


def get_meteotiles_legend_path(weather_product_run: WeatherProductRun) -> Path:
    return Path(settings.METEOTILES_BASEDIR) / get_meteotiles_legend_relpath(
        weather_product_run
    )


def get_meteotiles_product_forecast_url(
    weather_product_run: WeatherProductRun, forecast_step: int
) -> str:
    return "/".join(
        [
            settings.METEOTILES_URL,
            get_meteotiles_product_forecast_reldir(
                weather_product_run, forecast_step
            ).as_posix(),
        ]
    )


def get_meteotiles_product_legend_url(weather_product_run: WeatherProductRun) -> str:
    return "/".join(
        [
            settings.METEOTILES_URL,
            get_meteotiles_legend_relpath(weather_product_run).as_posix(),
        ]
    )


def get_arkimaps_product_forecast_reldir(
    weather_product_run: WeatherProductRun, forecast_step: int
) -> Path:
    return Path(
        weather_product_run.weather_model_run.reftime.strftime("%Y-%m-%dT%H:%M:%S"),
        f"{weather_product_run.short_name}+{forecast_step:03d}",
    )


def get_arkimaps_product_legend_relpath(weather_product_run: WeatherProductRun) -> Path:
    return Path(
        weather_product_run.weather_model_run.reftime.strftime("%Y-%m-%dT%H:%M:%S"),
        f"{weather_product_run.short_name}+legend.png",
    )
