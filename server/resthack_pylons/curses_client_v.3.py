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
    url = 'http://localhost:5421/veethree/pos_post'
    resp = urllib2.urlopen(url, params).read()
    data = simplejson.loads(resp)
    update_map(data)

def init_map(x_max,y_max):
    log = get_log()
    log.debug('setting up map')
    for y in range(1,y_max):
        #print '#'*x_max
        w_map.addstr(y,1,'#'*x_max)
    w_map.refresh()
    url = 'http://localhost:5421/veethree/pos_get'
    resp = urllib2.urlopen(url).read()
    data = simplejson.loads(resp)
    update_map(data)

def update_map(data):
    log = get_log()
    log.debug('updating map')
    for path in data['paths']:
        w_map.addch(path['y']+1,path['x']+1,' ')
    w_map.addch(data['avatar']['y']+1,data['avatar']['x']+1,'*')
    w_map.refresh()

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
x = y = 10
c = ''
valid_moves = ['u','d','r','l']
init_map(40,20)

while c != 'q':
    w_log.clear()
    qh.offset=1
    w_log.box()
    c = chr(screen.getch())
    log.debug('key: %s'%c)
    if c in valid_moves:
        move(c)
    else:
        log.error('bad key %c'%c)

curses.endwin()
curses.echo()
