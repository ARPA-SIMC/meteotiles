from django.contrib import admin

from .models import WeatherModel, WeatherModelRun, WeatherProductRun


class WeatherModelAdmin(admin.ModelAdmin):
    list_display = ["short_name", "long_name"]


class WeatherModelRunAdmin(admin.ModelAdmin):
    list_display = ["weather_model", "reftime"]
    list_filter = ["weather_model", "reftime"]


class WeatherProductRunAdmin(admin.ModelAdmin):
    list_display = ["short_name", "long_name", "weather_model_run"]


admin.site.register(WeatherModel, WeatherModelAdmin)
admin.site.register(WeatherModelRun, WeatherModelRunAdmin)
admin.site.register(WeatherProductRun, WeatherProductRunAdmin)
