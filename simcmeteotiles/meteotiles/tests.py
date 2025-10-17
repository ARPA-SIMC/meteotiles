from pathlib import Path
import tempfile

from django.test import TestCase, override_settings
from django.conf import settings

from .models import WeatherModel, WeatherModelRun, WeatherProductRun
from .utils import import_products


class UtilsTestCase(TestCase):
    def setUp(self):
        self.weather_model = WeatherModel(short_name="test", long_name="test_long_name")
        self.weather_model.save()
        self.tempdir = tempfile.TemporaryDirectory(delete=False)
        self.override = override_settings(METEOTILES_TILES_ROOT=self.tempdir.name)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        self.tempdir.cleanup()

    def test_import_products(self):
        jsonfile = Path(__file__).parent / "testdata" / "products.json"
        import_products(self.weather_model.short_name, jsonfile)
        self.assertEqual(
            WeatherModelRun.objects.count(), 1, "Only one WeatherModelRun was created"
        )
        self.assertEqual(
            WeatherProductRun.objects.count(), 50, "50 WeatherProductRun  were imported"
        )
        capeshear = WeatherProductRun.objects.get(
            short_name="capeshear_ita_small_tiles"
        )
        self.assertEqual(
            capeshear.forecast_steps,
            list(range(0, 90, 3)) + list(range(90, 241, 6)),
            "Forecast steps of CAPE shear were imported",
        )
