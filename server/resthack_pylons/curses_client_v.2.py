#!/usr/bin/env python
import curses
import simplejson
import urllib2, urllib

import logging
from inspect import getouterframes, currentframe

w_log = ''

class WindowHandler(logging.Handler):
    offset = 1
    def emit(self, record):
        w_log.addstr(self.offset, 1, self.format(record))
        self.offset += 1
        w_log.refresh()

def config_log():
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)
    #qh = QueueingHandler()
    qh = WindowHandler()
    qh.setLevel(logging.DEBUG)
    qh.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
    root.addHandler(qh)
    logging.basicConfig()
    return qh

def get_log(level=logging.DEBUG):
    name_mod = __name__
    name_caller = getouterframes(currentframe())[1][3]
    if name_mod != '__main__':
        name = '.'.join([name_mod, name_caller])
    else:
        name = name_caller
    return logging.getLogger(name)

def move(direction):
    log = get_log()
    log.info('moving %s'%direction)
    params = urllib.urlencode(dict(move=direction))
    url = 'http://localhost:5421/space/move'
    resp = urllib2.urlopen(url, params).read()
    return resp

def show_map(m_x, m_y):
    log = get_log()
    log.debug('getting space')
    url = 'http://localhost:5421/space/%d,%d-%d,%d'%(
            m_x,m_y,m_x+w_width,m_y+w_height)
    resp = urllib2.urlopen(url).read()

    log.debug('parsing space')
    things = simplejson.loads(resp)

    log.debug('building walls')
    walls1 = []
    walls2 = []
    p = {'x':0,'y':0}
    for thing in things:
        if thing['type'] == 'player':
            p = thing
        elif thing['type'] == 'wall1':
            walls1.append((thing['x'],thing['y']))
        elif thing['type'] == 'wall2':
            walls2.append((thing['x'],thing['y']))

    log.debug('updating viewport')
    for y in range(m_y,m_y+w_height):
        for x in range(m_x,m_x+w_width):
            c = ' '
            if (x,y) in walls1:
                c = 'X'
            elif (x,y) in walls2:
                c = '#'
            elif x == p['x'] and y == p['y']:
                c = 'P'
            w_map.addch(1+(y-m_y),1+(x-m_x),c)

    w_map.refresh()
    log.debug('done')


screen = curses.initscr()
curses.noecho()
screen.clear()
#curses.curs_set(0)
log_lines = 10
w_width = curses.COLS-2
w_height = curses.LINES-4-log_lines

w_map = curses.newwin(w_height+2,w_width+2,0,0)
w_map.box()
w_map.overlay(screen)

w_log = curses.newwin(log_lines+2,w_width+2,w_height+2,0)
w_log.box()
w_log.overlay(screen)

screen.refresh()

qh = config_log()
log = logging.getLogger()
x = y = 0
c = ''
moves = {'n':(0,-1), 'e':(1,0), 's':(0,1), 'w':(-1,0)}
show_map(x,y)

while c != 'q':
    w_log.clear()
    w_log.box()
    qh.offset = 1
    c = chr(screen.getch())
    log.debug('key: %s'%c)
    if c in moves.keys():
        move(c)
    elif c.lower() in moves.keys():
        c = c.lower()
        x = x+(moves[c][0]*5)
        y = y+(moves[c][1]*5)
    show_map(x,y)

curses.endwin()
curses.echo()
