import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from paste.httpexceptions import HTTPNotImplemented

from resthack.lib.base import BaseController, render

from resthack import model
import simplejson

log = logging.getLogger(__name__)

class MapController(BaseController):
    """REST Controller styled on the Atom Publishing Protocol"""
    # To properly map this controller, ensure your config/routing.py
    # file has a resource setup:
    #     map.resource('map', 'map')

    def index(self, format='html'):
        """GET /map: All items in the collection"""
        # url('map')
        map = model.meta.Session.query(model.Map).one()
        ret_dict = {}
        for attr in map._sa_class_manager:
            if attr == 'tiles': continue
            ret_dict[attr] = getattr(map, attr)
        response.headers['content-type'] = 'text/javascript'
        return simplejson.dumps(ret_dict)

    def create(self):
        """POST /map: Create a new item"""
        # url('map')
        raise HTTPNotImplemented, 'DONT DO THAT!'

    def new(self, format='html'):
        """GET /map/new: Form to create a new item"""
        # url('new_map')
        raise HTTPNotImplemented, 'DONT DO THAT!'

    def update(self, id):
        """PUT /map/id: Update an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="PUT" />
        # Or using helpers:
        #    h.form(url('map', id=ID),
        #           method='put')
        # url('map', id=ID)
        raise HTTPNotImplemented, 'DONT DO THAT!'

    def delete(self, id):
        """DELETE /map/id: Delete an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="DELETE" />
        # Or using helpers:
        #    h.form(url('map', id=ID),
        #           method='delete')
        # url('map', id=ID)
        raise HTTPNotImplemented, 'DONT DO THAT!'

    def show(self, id, format='html'):
        """GET /map/id: Show a specific item"""
        # url('map', id=ID)
        #if id != 'all_tiles':
        #    raise HTTPNotImplemented, 'Huuuh... what?'
        map = model.meta.Session.query(model.Map).one()
        ret_arr = []
        for tile in map.tiles:
            tile_dict = {}
            for attr in tile._sa_class_manager:
                if attr == 'map': continue
                tile_dict[attr] = getattr(tile, attr)
            ret_arr.append(tile_dict)
        response.headers['content-type'] = 'text/javascript'
        return simplejson.dumps(ret_arr, indent=2)

    def edit(self, id, format='html'):
        """GET /map/id/edit: Form to edit an existing item"""
        # url('edit_map', id=ID)
        raise HTTPNotImplemented, 'DONT DO THAT!'
