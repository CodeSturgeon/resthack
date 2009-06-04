import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from resthack.lib.base import BaseController, render

from resthack.model import Map, Tile, meta, _Base

import random

log = logging.getLogger(__name__)

class UtilController(BaseController):

    def index(self):
        # Return a rendered template
        #return render('/util.mako')
        # or, return a response
        return 'Hello World'

    def setup(self):
        try:
            map = meta.Session.query(Map).one()
            return 'All already setup'
        except:
            pass
        _Base.metadata.create_all(bind=meta.engine)
        random.seed()
        size = 9
        map = Map(name='new_map', x_min=0, y_min=0, x_max=size, y_max=size)
        meta.Session.add(map)
        for x in range(size+1):
            for y in range(size+1):
                tile_type = random.choice(['clear','solid'])
                tile = Tile(map=map, x=x, y=y, type=tile_type)
                meta.Session.add(tile)
        meta.Session.commit()
        return 'Done with setup'
