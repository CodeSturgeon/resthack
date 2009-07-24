#!/usr/bin/env python

# Curses client next gen

import curses
import logging
import urllib, urllib2
from inspect import getouterframes, currentframe
import os
import simplejson

def config_log():
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)
    file_handler = logging.FileHandler('curses.log')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
    root.addHandler(file_handler)

def get_log(level=logging.DEBUG):
    name_mod = __name__
    name_caller = getouterframes(currentframe())[1][3]
    if name_mod != '__main__':
        name = '.'.join([name_mod, name_caller])
    else:
        name = name_caller
    return logging.getLogger(name)

class Map(object):
    def __init__(self, height, width, avatar_y = 10, avatar_x = 10):
        self.pad = curses.newpad(height+2,width+2)
        #self.pad.bkgd('#')
        self.pad.border(*[ord('0') for lop in range(8)])
        [self.pad.addstr(lop+1,1,'#'*width) for lop in range(height)]
        self.avatar_y = avatar_y
        self.avatar_x = avatar_x
        self.log = get_log()
    def update(self, data):
        self.log.debug('updating %s'%data)
        for path in data['paths']:
            self.pad.addch(path['y']+1,path['x']+1,ord(' '))
        self.avatar_x = data['avatar']['x']
        self.avatar_y = data['avatar']['y']
    def refresh(self):
        h, w = get_size()
        self.pad.move(self.avatar_y+1, self.avatar_x+1)
        self.pad.refresh(0,0,1,1,h-2,w-2)
    def load(self, url = 'http://localhost:5421/pos'):
        resp = urllib2.urlopen(url).read()
        data = simplejson.loads(resp)
        self.update(data)


def get_size():
    try:
        h, w  = int(os.environ['LINES']), int(os.environ['COLS'])
    except KeyError:
        try:
            h ,w = curses.tigetnum('lines'), curses.tigetnum('cols')
        except:
            try:
                s = struct.pack('HHHH', 0, 0, 0, 0)
                x = fcntl.ioctl(sys.stdout.fileno(), termios.TIOCGWINSZ, s)
                h, w = struct.unpack('HHHH', x)[:2]
            except:
                h, w = 25, 80
    return h, w
            
def post_move(direction):
    log = get_log()
    log.info('moving %s'%direction)
    params = urllib.urlencode(dict(move=direction))
    url = 'http://localhost:5421/pos'
    try:
        resp = urllib2.urlopen(url, params)
    except urllib2.HTTPError, e:
        resp = e
    data = simplejson.loads(resp.read())
    return data

def main(screen):
    config_log()
    log = get_log()
    log.debug('--setting up--')
    map = Map(20,40)
    map.load()

    ret = curses.KEY_RESIZE
    h, w = get_size()
    while ret != ord('q'):
        if ret == curses.KEY_LEFT: ret = ord('l')
        elif ret == curses.KEY_RIGHT: ret = ord('r')
        elif ret == curses.KEY_UP: ret = ord('u')
        elif ret == curses.KEY_DOWN: ret = ord('d')
        if ret == curses.KEY_RESIZE:
            h, w = get_size()
            log.debug('Rendering L:%d C:%d'%(h,w))
            screen.clear()
            screen.box()
            screen.addstr(0,((w-9)/2),'hello world')
            screen.refresh()
            map.refresh()
        else:
            try:
                c = chr(ret)
                if c == 'q':
                    return
                elif c in ['l','r','u','d']:
                    data = post_move(c)
                    if data.has_key('code'):
                        l = len(data['message'])
                        h2 = h/2
                        w2 = (w-l)/2
                        screen.addstr(h2-1,w2,(l+4)*'*')
                        screen.addstr(h2,w2,'* '+data['message']+' *')
                        screen.addstr(h2+1,w2,(l+4)*'*')
                        screen.refresh()
                    else:
                        map.update(data)
                        map.refresh()
            except ValueError:
                pass
        ret = screen.getch()

curses.wrapper(main)
