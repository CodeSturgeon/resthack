import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from paste.httpexceptions import HTTPNotImplemented

from resthack.lib.base import BaseController, render

log = logging.getLogger(__name__)

class TurnController(BaseController):
    """REST Controller styled on the Atom Publishing Protocol"""
    # To properly map this controller, ensure your config/routing.py
    # file has a resource setup:
    #     map.resource('turn', 'turn')

    def index(self, format='html'):
        """GET /turn: All items in the collection"""
        # url('turn')

    def create(self):
        """POST /turn: Create a new item"""
        # url('turn')

    def new(self, format='html'):
        """GET /turn/new: Form to create a new item"""
        # url('new_turn')

    def update(self, id):
        """PUT /turn/id: Update an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="PUT" />
        # Or using helpers:
        #    h.form(url('turn', id=ID),
        #           method='put')
        # url('turn', id=ID)

    def delete(self, id):
        """DELETE /turn/id: Delete an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="DELETE" />
        # Or using helpers:
        #    h.form(url('turn', id=ID),
        #           method='delete')
        # url('turn', id=ID)

    def show(self, id, format='html'):
        """GET /turn/id: Show a specific item"""
        # url('turn', id=ID)

    def edit(self, id, format='html'):
        """GET /turn/id/edit: Form to edit an existing item"""
        # url('edit_turn', id=ID)
