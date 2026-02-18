from django.urls import path
from django.contrib.auth import views as auth_views

from .views import api_weather_models_list, singlemap, doublemap


urlpatterns = [
    path('weather_models', api_weather_models_list, name='weather_models'),
    path('', singlemap, name='index'),
    path('singlemap', singlemap, name='singlemap'),
    path('doublemap', doublemap, name='doublemap'),
    path('login',  auth_views.LoginView.as_view(template_name='meteotiles/login.html', redirect_authenticated_user=True), name='login'),
    path('logout',  auth_views.LogoutView.as_view(), name='logout'),
]
