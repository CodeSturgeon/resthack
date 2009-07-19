from resthack.tests import *

class TestVeethreeController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='veethree', action='index'))
        # Test response...
