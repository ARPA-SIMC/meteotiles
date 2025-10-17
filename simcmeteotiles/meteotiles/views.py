from datetime import timedelta

from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import render

from .models import WeatherModel
from .utils import (
    get_meteotiles_product_forecast_url,
    get_meteotiles_product_legend_url,
)


def doublemap(request):
    return render(request, "meteotiles/doublemap.html")


def singlemap(request):
    return render(request, "meteotiles/singlemap.html")


def get_allowed_weather_models(request):
    if request.user is None or request.user.is_anonymous:
        return WeatherModel.objects.filter(public=True)
    else:
        return WeatherModel.objects.filter(
            Q(allowed_groups__in=request.user.groups.all()) | Q(public=True)
        ).distinct()


def api_weather_models_list(request):
    weather_models = get_allowed_weather_models(request)

    response = []
    for weather_model in weather_models:
        response.append(
            {
                "short_name": weather_model.short_name,
                "long_name": weather_model.long_name,
                "runs": [
                    {
                        "reftime": weather_model_run.reftime.isoformat(),
                        "products": [
                            {
                                "short_name": weather_product_run.short_name,
                                "long_name": weather_product_run.long_name,
                                "forecasts_urls": {
                                    (
                                        weather_model_run.reftime
                                        + timedelta(hours=fcstep)
                                    ).isoformat(): get_meteotiles_product_forecast_url(
                                        weather_product_run, fcstep
                                    )
                                    for fcstep in weather_product_run.forecast_steps
                                },
                                "lat_min": weather_product_run.lat_min,
                                "lon_min": weather_product_run.lon_min,
                                "lat_max": weather_product_run.lat_max,
                                "lon_max": weather_product_run.lon_max,
                                "zoom_min": weather_product_run.zoom_min,
                                "zoom_max": weather_product_run.zoom_max,
                                "zindex": weather_product_run.zindex,
                                "opacity": weather_product_run.opacity,
                                "legend_url": (
                                    get_meteotiles_product_legend_url(
                                        weather_product_run
                                    )
                                    if weather_product_run.legend_on
                                    else None
                                ),
                            }
                            for weather_product_run in weather_model_run.weatherproductrun_set.all()
                        ],
                    }
                    for weather_model_run in weather_model.weathermodelrun_set.all().order_by(
                        "reftime"
                    )
                ],
            }
        )

    return JsonResponse(
        {
            "weather_models": response,
        }
    )
