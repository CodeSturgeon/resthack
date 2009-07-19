"""The base Controller API

Provides the BaseController class for subclassing.
"""
from pylons.controllers import WSGIController
from pylons.templating import render_mako as render

from resthack.model import meta

from webob.exc import HTTPException
from pylons import request

class BaseController(WSGIController):

    def _perform_call(self, func, args):
        """WSGIController hackery.
        Hijack the calling to trap HTTPExceptions and note their message.
        This allows the message to be extracted propperly by error controller.
        Based on ideas from: http://www.siafoo.net/article/75
        """
        try:
            __traceback_hide__ = 'before_and_this'
            return func(**args)
        except HTTPException, httpe:
            request.environ['exception_error_text'] = httpe.message
            raise

    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        try:
            return WSGIController.__call__(self, environ, start_response)
        finally:
            meta.Session.remove()
