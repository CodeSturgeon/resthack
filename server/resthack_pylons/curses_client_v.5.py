#!/usr/bin/env python
import curses
import simplejson
import urllib2, urllib

import logging
from inspect import getouterframes, currentframe

w_log = ''
x = y = 10

class WindowHandler(logging.Handler):
    offset = 1
    def emit(self, record):
        if w_log == '': return
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

def move(direction,w_map):
    log = get_log()
    log.info('moving %s'%direction)
    params = urllib.urlencode(dict(move=direction))
    url = 'http://localhost:5421/pos'
    try:
        resp = urllib2.urlopen(url, params)
    except urllib2.HTTPError, e:
        resp = e
    try:
        data = simplejson.loads(resp.read())
        update_map(data,w_map)
    except ValueError:
        log.warn(resp)

def init_map(x_max,y_max,w_map):
    log = get_log()
    log.debug('setting up map')
    for y in range(1,y_max):
        #print '#'*x_max
        w_map.addstr(y,1,'#'*x_max)
    w_map.refresh()
    url = 'http://localhost:5421/pos'
    resp = urllib2.urlopen(url).read()
    data = simplejson.loads(resp)
    update_map(data,w_map)

def update_map(data,w_map):
    global x,y
    log = get_log()
    log.debug('updating map')
    if data.has_key('code'):
        log.warn(data['message'])
        return
    for path in data['tiles']:
        w_map.addch(path['y']+1,path['x']+1,' ')
        shape = path['shape']
        if shape & 1:
            w_map.addch(path['y'],path['x']+1, ' ')
        if shape & 2:
            w_map.addch(path['y']+1,path['x']+2, ' ')
        if shape & 4:
            w_map.addch(path['y']+2,path['x']+1, ' ')
        if shape & 8:
            w_map.addch(path['y']+1,path['x'], ' ')
    x = data['avatar']['x']
    y = data['avatar']['y']
    w_map.move(y+1,x+1)
    w_map.refresh()

def main(screen):
    global w_log
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
    c = ''
    valid_moves = [1,2,4,8]
    init_map(40,20,w_map)

    while c != 'q':
        w_log.clear()
        qh.offset=1
        w_log.box()
        c = int(chr(screen.getch()))
        log.debug('key: %s'%c)
        if c in valid_moves:
            move(c,w_map)
        else:
            log.error('bad key %c'%c)

    curses.endwin()

curses.wrapper(main)
