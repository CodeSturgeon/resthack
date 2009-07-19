from pylons import request

from resthack.lib.base import BaseController
import simplejson

class ErrorController(BaseController):
    def document(self):
        """Render the error document"""
        ret = {}
        resp = request.environ.get('pylons.original_response')
        ret['code'] = request.GET.get('code', resp.status_int)
        ret['message'] = request.environ.get('exception_error_text',
                                                'no-message')
        return simplejson.dumps(ret, indent=2)
