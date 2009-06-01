import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from resthack.lib.base import BaseController, render

log = logging.getLogger(__name__)

class MapController(BaseController):
    """REST Controller styled on the Atom Publishing Protocol"""
    # To properly map this controller, ensure your config/routing.py
    # file has a resource setup:
    #     map.resource('map', 'map')

    def index(self, format='html'):
        """GET /map: All items in the collection"""
        # url('map')

    def create(self):
        """POST /map: Create a new item"""
        # url('map')

    def new(self, format='html'):
        """GET /map/new: Form to create a new item"""
        # url('new_map')

    def update(self, id):
        """PUT /map/id: Update an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="PUT" />
        # Or using helpers:
        #    h.form(url('map', id=ID),
        #           method='put')
        # url('map', id=ID)

    def delete(self, id):
        """DELETE /map/id: Delete an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="DELETE" />
        # Or using helpers:
        #    h.form(url('map', id=ID),
        #           method='delete')
        # url('map', id=ID)

    def show(self, id, format='html'):
        """GET /map/id: Show a specific item"""
        # url('map', id=ID)

    def edit(self, id, format='html'):
        """GET /map/id/edit: Form to edit an existing item"""
        # url('edit_map', id=ID)
