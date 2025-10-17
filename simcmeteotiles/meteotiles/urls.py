from django.urls import path

from .views import api_weather_models_list, singlemap, doublemap


urlpatterns = [
    path('weather_models', api_weather_models_list),
    path('singlemap', singlemap, name='singlemap'),
    path('doublemap', doublemap, name='doublemap'),
]
