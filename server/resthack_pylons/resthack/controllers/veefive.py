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
view_radius = 4 # Units distance you can see in any direction outside your 1x1
shape_vector = {1: (0,-1), 4: (0,1), 8: (-1,0), 2: (1,0)}

def custom_encode(obj):
    try:
        getattr(obj, 'serial')
        return obj.serial()
    except AttributeError:
        raise TypeError(repr(obj) + "Yuky JSON!")

def get_tiles():
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

    visible = []

    tiles = {}
    for path in paths:
        if path.x == avatar.x and path.y == avatar.y:
            visible.append({'x': path.x, 'y': path.y,
                            'shape':path.get_shape()})
        tiles[(path.x,path.y)] = path.get_shape()

    master_vectors = shape_vector.values()
    step = 1
    while len(master_vectors) > 0:
        vectors = list(master_vectors)
        for v in vectors:
            qx = avatar.x + (v[0]*step)
            qy = avatar.y + (v[1]*step)
            if (qx,qy) in tiles:
                visible.append({'x':qx,'y':qy,'shape':tiles[(qx,qy)]})
            else:
                master_vectors.remove(v)
        step += 1

    # X-Ray vision debug - dumps all tiles
    if 0:
        visible = [{'x':tile[0],'y':tile[1],'shape':tiles[tile]}
                    for tile in tiles]

    return visible

class VeefiveController(BaseController):

    def pos_get(self):
        avatar = Session.query(Avatar).one()

        tiles = get_tiles()

        ret = {'tiles':tiles, 'avatar':avatar}
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

        pre_tiles = get_tiles()

        avatar.x += shape_vector[move][0]
        avatar.y += shape_vector[move][1]
        Session.commit()

        post_tiles = get_tiles()

        visible = [tile for tile in post_tiles if tile not in pre_tiles]

        ret = {'tiles':visible, 'avatar':avatar}
        return simplejson.dumps(ret, indent=2, default=custom_encode)
