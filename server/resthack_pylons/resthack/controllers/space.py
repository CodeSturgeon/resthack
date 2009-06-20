import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from resthack.lib.base import BaseController, render
from resthack.model import Thing
from resthack.model.meta import Session
import simplejson

log = logging.getLogger(__name__)
moves = {'n':(0,-1), 'e':(1,0), 's':(0,1), 'w':(-1,0)}

class SpaceController(BaseController):

    def index(self):
        # Return a rendered template
        #return render('/space.mako')
        # or, return a response
        return 'Hello World'

    def all(self):
        things = Session.query(Thing).all()
        ret = []
        for thing in things:
            rep = {}
            for attr in ['x','y','id','type']:
                rep[attr] = getattr(thing, attr)
            ret.append(rep)
        return simplejson.dumps(ret)


    def move(self):
        move = request.POST.get('move','')
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
