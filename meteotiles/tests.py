from pathlib import Path
import tempfile
from datetime import datetime, timezone

from django.core.management import call_command
from django.test import TestCase, override_settings
from django.conf import settings

from .models import WeatherModel, WeatherModelRun, WeatherProductRun


class UtilsTestCase(TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory(delete=False)
        self.override = override_settings(METEOTILES_BASEDIR=self.tempdir.name)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        self.tempdir.cleanup()

    def test_import_arkimaps_products(self):
        weather_model = WeatherModel(short_name='icon_2I', long_name='ICON-2I', public=True)
        weather_model.full_clean()
        weather_model.save()
        inputdir = settings.BASE_DIR / Path('testdata/data/20250903_t')
        call_command('meteotiles-import-arkimaps-products', 'icon_2I', inputdir)
        self.assertEqual(WeatherModelRun.objects.count(), 1)
        self.assertEqual(WeatherModelRun.objects.first().reftime, datetime(2025, 9, 3, tzinfo=timezone.utc))
        self.assertEqual(WeatherModelRun.objects.first().weatherproductrun_set.count(), 1)
        self.assertEqual(WeatherModelRun.objects.first().weatherproductrun_set.first().short_name, "tiles/t2m_emro_tiles")
        self.assertEqual(WeatherModelRun.objects.first().weatherproductrun_set.first().long_name, "Temperature at 2 metres")
        self.assertEqual(WeatherModelRun.objects.first().weatherproductrun_set.first().forecast_steps, [0, 1])
