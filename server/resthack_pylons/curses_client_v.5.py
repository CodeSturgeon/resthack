#!/usr/bin/env python
import curses
import simplejson
import urllib2, urllib

import logging
from inspect import getouterframes, currentframe

w_log = ''
avatar_id = 2
pos_url = 'http://localhost:5421/avatars/%d/pos'%avatar_id

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
    wh = WindowHandler()
    wh.setLevel(logging.DEBUG)
    wh.setFormatter(logging.Formatter('%(name)s - %(message)s'))
    root.addHandler(wh)
    logging.basicConfig()
    return wh

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
    try:
        resp = urllib2.urlopen(pos_url, params)
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
    for y in range(1,y_max+1):
        #print '#'*x_max
        w_map.addstr(y,1,'X'*x_max)
    w_map.refresh()
    resp = urllib2.urlopen(pos_url).read()
    data = simplejson.loads(resp)
    update_map(data,w_map, first_run=True)

def update_map(data,w_map,first_run=False,_cleared=[],_static={}):
    log = get_log()
    log.debug('updating map')
    if data.has_key('code'):
        log.warn(data['message'])
        return

    # Clear and shade any tiles new to this session
    for path in data['tiles']:
        # Check if tile was previously processed
        if path not in _cleared:
            w_map.addch(path['y']+1,path['x']+1,' ')
            _cleared.append((path['x'],path['y']))

            # Do shading of known but not seen tiles
            shape = path['shape']
            if shape & 1 and (path['x'],path['y']-1) not in _cleared:
                w_map.addch(path['y'],path['x']+1, '@')
            if shape & 2 and (path['x']+1,path['y']) not in _cleared:
                w_map.addch(path['y']+1,path['x']+2, '@')
            if shape & 4 and (path['x'],path['y']+1) not in _cleared:
                w_map.addch(path['y']+2,path['x']+1, '@')
            if shape & 8 and (path['x']-1,path['y']) not in _cleared:
                w_map.addch(path['y']+1,path['x'], '@')

    # Clear last location
    (x,y) = _static.get('last_location', (None, None))
    if x is not None:
        w_map.addch(y+1,x+1,' ')

    # Remove others from last update
    for other in _static.get('others', []):
        w_map.addch(other['y']+1,other['x']+1,' ')

    # Draw others from this update
    new_others = data['others']
    for other in new_others:
        w_map.addch(other['y']+1,other['x']+1,"'")

    # Stash others for next update
    _static['others'] = new_others

    # Draw avatar at new position and stash for next update
    x = data['avatar']['x']
    y = data['avatar']['y']
    w_map.addch(y+1,x+1,'*')
    _static['last_location'] = (x,y)

    # Move cursor out of the way
    w_map.move(0,0)

    # Show changes
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

    wh = config_log()
    log = logging.getLogger()
    asc = ''
    valid_moves = [1,2,4,8]
    init_map(40,20,w_map)

    while asc != 'q':
        w_log.clear()
        wh.offset=1
        w_log.box()
        key = (screen.getch())
        if key in range(256):
            asc = chr(key).lower()
        else:
            asc = ''
        log.debug('key: %d [%s]'%(key,asc))
        # UP
        if asc in ['w','i'] or key == 259:
            move(1,w_map)
        # DOWN
        elif asc in ['s','k'] or key == 258:
            move(4,w_map)
        # LEFT
        elif asc in ['a','j'] or key == 260:
            move(8,w_map)
        # RIGHT
        elif asc in ['d','l'] or key == 261:
            move(2,w_map)
        else:
            log.error('bad key %d'%key)

    curses.endwin()

curses.wrapper(main)
