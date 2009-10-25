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
view_radius = 5 # Effective 11x11
shape_vector = {1: (0,-1), 4: (0,1), 8: (-1,0), 2: (1,0)}

def custom_encode(obj):
    try:
        getattr(obj, 'serial')
        return obj.serial()
    except AttributeError:
        raise TypeError(repr(obj) + "Yuky JSON!")

class VeefiveController(BaseController):

    def pos_get(self):
        avatar = Session.query(Avatar).one()
        x_min = avatar.x - view_radius
        x_max = avatar.x + view_radius
        y_min = avatar.y - view_radius
        y_max = avatar.y + view_radius
        paths = Session.query(Path).filter(sa.and_(
                    Path.x >= x_min, Path.x <= x_max,
                    Path.y >= y_min, Path.y <= y_max,
                    sa.or_(Path.x == avatar.x, Path.y == avatar.y)
                )).all()
        #visible = []
        # FIXME can still see through walls...
        #for tile in paths:
        #    if tile.x == avatar.x or tile.y ==avatar.y:
        #        visible.append(tile)
        visible = paths
        ret = {'tiles':visible, 'avatar':avatar}
        response.headers['Content-type'] = 'text/plain'
        return simplejson.dumps(ret, indent=2, default=custom_encode)

    def maze_dump(self):
        paths = Session.query(Path).all()
        maze_tiles = {}
        for path in paths:
            maze_tiles[(path.x, path.y)] = ' ' # hex(path.get_shape())[-1].upper()

        lines = []

        tenline = ['  *']
        unitline = ['  *']
        for ten in range(0,40,10):
            tenline.append(str(ten)[0]*10)
            unitline.append(''.join(map(str,range(10))))
        lines.append(''.join(tenline))
        lines.append(''.join(unitline))
        lines.append('***'+'*'*40)

        for y in range(20):
            line = []
            line.append('%02d*'%y)
            for x in range(40):
                line.append(maze_tiles.get((x,y), '#'))
            line.append('*')
            lines.append(''.join(line))
        lines.append('***'+'*'*40)
        response.headers['Content-type'] = 'text/plain'
        return '\n'.join(lines)


    def pos_post(self):
        move = int(request.POST.get('move',0))
        log.debug('move: %s'%move)
        if move not in [1,2,4,8]:
            raise HTTPClientError('bad move')
        avatar = Session.query(Avatar).one()
        current_path = Session.query(Path).filter(sa.and_(
                            Path.x == avatar.x, Path.y == avatar.y)).one()
        if not move & current_path.get_shape():
            raise HTTPClientError('cannot go that way')
        avatar.x += shape_vector[move][0]
        avatar.y += shape_vector[move][1]
        Session.commit()
        if shape_vector[move][0] == 0: # Vertical move
            x_min = avatar.x - view_radius
            x_max = avatar.x + view_radius
            y_min = y_max = avatar.y + (shape_vector[move][1]*view_radius)
        else: # Horizontal move
            y_min = avatar.y - view_radius
            y_max = avatar.y + view_radius
            x_min = x_max = avatar.x + (shape_vector[move][0]*view_radius)
        paths = Session.query(Path).filter(sa.and_(
                    Path.x >= x_min, Path.x <= x_max,
                    Path.y >= y_min, Path.y <= y_max
                )).all()
        visible = paths
        #visible = []
        # FIXME can still see through walls...
        #for tile in paths:
        #    if tile.x == avatar.x or tile.y ==avatar.y:
        #        visible.append(tile)
        ret = {'tiles':visible, 'avatar':avatar}
        return simplejson.dumps(ret, indent=2, default=custom_encode)



# Calculate Path diff
# Query and return Path objs
# x +/- (radius * move * 2) - (radius * move)
