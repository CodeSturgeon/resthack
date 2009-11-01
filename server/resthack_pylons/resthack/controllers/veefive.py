import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from resthack.lib.base import BaseController, render

from resthack.model import Tile, Avatar
from resthack.model import Map as Mapo
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

def get_tiles(avatar):
    x_min = avatar.x - view_radius
    x_max = avatar.x + view_radius
    y_min = avatar.y - view_radius
    y_max = avatar.y + view_radius

    paths = Session.query(Tile).filter(sa.and_(
                Tile.map_id == avatar.map_id,
                Tile.x >= x_min, Tile.x <= x_max,
                Tile.y >= y_min, Tile.y <= y_max,
                sa.or_(Tile.x == avatar.x, Tile.y == avatar.y)
            )).all()

    others = Session.query(Avatar).filter(sa.and_(
                Avatar.id != avatar.id,
                Avatar.map_id == avatar.map_id,
                Avatar.x >= x_min, Avatar.x <= x_max,
                Avatar.y >= y_min, Avatar.y <= y_max,
                sa.or_(Avatar.x == avatar.x, Avatar.y == avatar.y)
            )).all()

    # Get all the Tile objs -> {(x,y):shape}
    tiles = {}
    for path in paths:
        tiles[(path.x,path.y)] = path.shape

    # Find all visible open spaces
    visible_locations = []
    master_vectors = shape_vector.values()
    step = 1
    while len(master_vectors) > 0:
        vectors = list(master_vectors)
        for v in vectors:
            qx = avatar.x + (v[0]*step)
            qy = avatar.y + (v[1]*step)
            if (qx,qy) in tiles:
                visible_locations.append((qx,qy))
            else:
                master_vectors.remove(v)
        step += 1

    # Check others to see if they are in a visible location
    visible_others = []
    for other in others:
        if (other.x,other.y) in visible_locations:
            visible_others.append(other)

    # Get each visible location's tile
    visible_tiles = [{'x':loc[0],'y':loc[1],'shape':tiles[(loc[0],loc[1])]}
                        for loc in visible_locations+[(avatar.x,avatar.y)]]

    # X-Ray vision debug - dumps all tiles
    if 0:
        visible_tiles = [{'x':tile[0],'y':tile[1],'shape':tiles[tile]}
                    for tile in tiles]

    return visible_tiles, visible_others

class VeefiveController(BaseController):

    def pos_get(self, aid):
        avatar = Session.query(Avatar).filter(Avatar.name==aid).one()

        tiles, others = get_tiles(avatar)

        ret = {'tiles':tiles, 'avatar':avatar, 'others':others,
                'map':avatar.map}
        response.headers['Content-type'] = 'text/plain'
        return simplejson.dumps(ret, indent=2, default=custom_encode)

    def maze_dump(self, map_name):
        maze = Session.query(Mapo).filter(Mapo.name==map_name).one()
        paths = Session.query(Tile).filter(Tile.map==maze).all()
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
        lines.append('   '+'*'*40)
        response.headers['Content-type'] = 'text/plain'
        return '\n'.join(lines)


    def pos_post(self,aid):
        move = int(request.POST.get('move',0))
        log.debug('move: %s'%move)
        if move not in [1,2,4,8]:
            raise HTTPClientError('bad move')
        avatar = Session.query(Avatar).filter(Avatar.name==aid).one()
        current_path = Session.query(Tile).filter(sa.and_(
                            Tile.map == avatar.map,
                            Tile.x == avatar.x, Tile.y == avatar.y)).one()
        if not move & current_path.shape:
            raise HTTPClientError('cannot go that way')

        pre_tiles = get_tiles(avatar)[0]

        avatar.x += shape_vector[move][0]
        avatar.y += shape_vector[move][1]
        Session.commit()

        post_tiles, others = get_tiles(avatar)

        visible = [tile for tile in post_tiles if tile not in pre_tiles]

        ret = {'tiles':visible, 'avatar':avatar, 'others':others,
                'map':avatar.map}
        return simplejson.dumps(ret, indent=2, default=custom_encode)
