from django.contrib.auth.models import Group

from django.db import models


# Weather model, e.g. ICON or IFS
class WeatherModel(models.Model):
    short_name = models.CharField(max_length=255)
    long_name = models.CharField(max_length=255)
    allowed_groups = models.ManyToManyField(
        Group, related_name="weather_models", blank=True
    )
    public = models.BooleanField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["short_name"], name="unique_short_name"),
        ]

    def __str__(self):
        return f"{self.short_name} - {self.long_name}"


## Run of a weather model, e.g. ICON run on 2025-01-01 00:00
class WeatherModelRun(models.Model):
    weather_model = models.ForeignKey(WeatherModel, on_delete=models.CASCADE)
    reftime = models.DateTimeField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["weather_model", "reftime"],
                name="unique_weather_models_reftime",
            ),
        ]

    def __str__(self):
        return f"{self.weather_model} - {self.reftime}"


# Product of weather model run
class WeatherProductRun(models.Model):
    short_name = models.CharField(max_length=255)
    long_name = models.CharField(max_length=255)
    weather_model_run = models.ForeignKey(WeatherModelRun, on_delete=models.CASCADE)
    forecast_steps = models.JSONField()
    lat_min = models.FloatField()
    lon_min = models.FloatField()
    lat_max = models.FloatField()
    lon_max = models.FloatField()
    zoom_min = models.IntegerField()
    zoom_max = models.IntegerField()
    zindex = models.IntegerField(null=True)
    opacity = models.FloatField(null=True)
    legend_on = models.BooleanField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["weather_model_run", "short_name"],
                name="unique_weather_model_run_short_name",
            ),
        ]

    def __str__(self):
        return f"{self.weather_model_run} - {self.short_name} - {self.long_name}"
