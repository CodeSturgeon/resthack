import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from resthack.lib.base import BaseController, render

from resthack.model import Path, Avatar
from resthack.model.meta import Session

from webob.exc import HTTPClientError

import sqlalchemy as sa
import simplejson

log = logging.getLogger(__name__)
view_radius = 1 # Effective 21x21
moves = {'u': (0,-1), 'd': (0,1), 'l': (-1,0), 'r': (1,0)}

def custom_encode(obj):
    try:
        getattr(obj, 'serial')
        return obj.serial()
    except AttributeError:
        raise TypeError(repr(obj) + "Yuky JSON!")

class VeethreeController(BaseController):

    def bang(self):
        raise HTTPClientError('unhappyness')

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
        ret = {'paths':paths, 'avatar':avatar}
        return simplejson.dumps(ret, indent=2, default=custom_encode)

    def pos_post(self):
        move = request.POST.get('move','').lower()
        if move not in moves.keys():
            return 'bad move'
        avatar = Session.query(Avatar).one()
        current_path = Session.query(Path).filter(sa.and_(
                            Path.x == avatar.x, Path.y == avatar.y)).one()
        if move not in current_path.exit_list():
            return 'cannot go that way'
        avatar.x += moves[move][0]
        avatar.y += moves[move][1]
        Session.commit()
        if moves[move][0] == 0: # Vertical move
            x_min = avatar.x - view_radius
            x_max = avatar.x + view_radius
            y_min = y_max = avatar.y + (moves[move][1]*view_radius)
        else: # Horizontal move
            y_min = avatar.y - view_radius
            y_max = avatar.y + view_radius
            x_min = x_max = avatar.x + (moves[move][0]*view_radius)
        paths = Session.query(Path).filter(sa.and_(
                    Path.x >= x_min, Path.x <= x_max,
                    Path.y >= y_min, Path.y <= y_max
                )).all()
        ret = {'paths':paths, 'avatar':avatar}
        return simplejson.dumps(ret, indent=2, default=custom_encode)



# Calculate Path diff
# Query and return Path objs
# x +/- (radius * move * 2) - (radius * move)
