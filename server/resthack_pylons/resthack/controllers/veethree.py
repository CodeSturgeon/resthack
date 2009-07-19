import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from resthack.lib.base import BaseController, render

from resthack.model import Path, Avatar
from resthack.model.meta import Session

import sqlalchemy as sa
import simplejson

log = logging.getLogger(__name__)
view_radius = 1 # Effective 21x21

def custom_encode(obj):
    try:
        getattr(obj, 'serial')
        return obj.serial()
    except AttributeError:
        raise TypeError(repr(obj) + "Yuky JSON!")

class VeethreeController(BaseController):

    def pos_get(self):
        avatar = Session.query(Avatar).one()
        x_min = avatar.x - view_radius
        x_max = avatar.x + view_radius
        y_min = avatar.y - view_radius
        y_max = avatar.y + view_radius
        paths = Session.query(Path).filter(sa.and_(
                    Path.x >= x_min, Path.x <= x_max,
                    Path.y >= y_min, Path.y <= y_max
                )).all()
        return simplejson.dumps(paths, indent=2, default=custom_encode)

    def pos_post(self):
        pass
