import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from resthack.lib.base import BaseController, render

from resthack.model import Path, Avatar
from resthack.model.meta import Session

import sqlalchemy as sa

log = logging.getLogger(__name__)
view_radius = 10 # Effective 21x21

class VeethreeController(BaseController):

    def pos_get(self):
        avatar = Session.query(Avatar).one()
        x_min = avatar.x - view_radius
        x_max = avatar.x + view_radius
        y_min = avatar.y - view_radius
        y_max = avatar.y + view_radius
        paths = Session.query(Path).filter(sa.and_(
                    Avatar.x >= x_min, Avatar.x <= x_max,
                    Avatar.y >= y_min, Avatar.y <= y_max
                )).all()
        return paths

    def pos_post(self):
        pass
