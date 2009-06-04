from resthack.tests import *

class TestUtilController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='util', action='index'))
        # Test response...
