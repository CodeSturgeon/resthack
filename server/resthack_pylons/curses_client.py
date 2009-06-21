#!/usr/bin/env python
import curses
import simplejson
import urllib2, urllib

screen = curses.initscr()
curses.noecho()
screen.clear()
#w_width = curses.COLS-2
#w_height = curses.LINES-2
w_width = 40
w_height = 20

main_w = curses.newwin(w_height+2,w_width+2,0,0)
main_w.box()
main_w.overlay(screen)
screen.refresh()
main_w.refresh()

def move(direction):
    params = urllib.urlencode(dict(move=direction))
    url = 'http://localhost:5421/space/move'
    resp = urllib2.urlopen(url, params).read()
    return move

def show_map(m_x, m_y):
    url = 'http://localhost:5421/space/%d,%d-%d,%d'%(
            m_x,m_y,m_x+w_width,m_y+w_height)
    resp = urllib2.urlopen(url).read()

    things = simplejson.loads(resp)

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

    for y in range(m_y,m_y+w_height):
        for x in range(m_x,m_x+w_width):
            c = ' '
            if (x,y) in walls1:
                c = 'X'
            elif (x,y) in walls2:
                c = '#'
            elif x == p['x'] and y == p['y']:
                c = 'P'
            main_w.addch(1+(y-m_y),1+(x-m_x),c)

    main_w.refresh()

c = x = y = 0
moves = {'n':(0,-1), 'e':(1,0), 's':(0,1), 'w':(-1,0)}
while c != 'q':
    show_map(x,y)
    c = chr(screen.getch())
    if c in moves.keys():
        move(c)
    elif c.lower() in moves.keys():
        c = c.lower()
        x = x+moves[c][0]
        y = y+moves[c][1]

curses.endwin()
