from resthack.tests import *

class TestSpaceController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='space', action='index'))
        # Test response...
