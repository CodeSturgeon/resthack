import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from resthack.lib.base import BaseController, render
from resthack.model import Thing
from resthack.model.meta import Session
import simplejson

log = logging.getLogger(__name__)
moves = {'n':(0,-1), 'e':(1,0), 's':(0,1), 'w':(-1,0)}

def dump_things(things):
    ret = []
    for thing in things:
        rep = {}
        for attr in ['x','y','type']:
            rep[attr] = getattr(thing, attr)
        ret.append(rep)
    return simplejson.dumps(ret)

class SpaceController(BaseController):

    def index(self):
        # Return a rendered template
        #return render('/space.mako')
        # or, return a response
        return 'Hello World'

    def all(self):
        things = Session.query(Thing).all()
        return dump_things(things)

    def move(self):
        move = request.POST.get('move','').lower()
        if move not in moves.keys():
            return 'bad move'
        player = Session.query(Thing).filter_by(type='player').one()
        mx = moves[move][0]+player.x
        my = moves[move][1]+player.y
        loc_cont = Session.query(Thing).filter_by(x=mx, y=my).all()
        if len(loc_cont)>0:
            return 'space blocked'
        player.x = mx
        player.y = my
        Session.commit()
        return 'move ok'

    def query(self, x1, x2, y1, y2):
        things = Session.query(Thing).filter(
                'x>=:x1 and x<:x2 and y>=:y1 and y<:y2').params(
                    x1=x1,x2=x2,y1=y1,y2=y2).all()
        return dump_things(things)
