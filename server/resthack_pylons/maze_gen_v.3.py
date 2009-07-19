#!/usr/bin/env python
import random
if 1:
    from paste.deploy import appconfig
    from pylons import config

    from resthack.model import Path
    from resthack.model.meta import Session

    from resthack.config.environment import load_environment

    conf = appconfig('config:development.ini', relative_to='.')
    load_environment(conf.global_conf, conf.local_conf)

# Set initial location
x=y=10
# Define maze size
x_max=40
y_max=20
x_min=y_min=0
# Setup tracking lists
cleared=[]
blocked=[]
# Four basic direction vectors
vectors = [(1,0),(0,1),(-1,0),(0,-1)]
# Backtracking offset
offest = 0

def dump_maze():
    for sy in range(y_min,y_max):
        tiles = []
        for sx in range(x_min,x_max):
            if x==sx and y==sy:
                tiles.append('#')
            elif (sx,sy) == cleared[-1]:
                tiles.append('O')
            elif (sx,sy) in cleared:
                tiles.append(' '),
            elif (sx,sy) in blocked:
                tiles.append('X')
            else:
                tiles.append('?'),
        print ''.join(tiles)

while 1:
    if (x,y) not in cleared:
        cleared.append((x,y))

    # Rectify surroundings
    # Look in each direction
    open = []
    for (x_d, y_d) in vectors:
        # adj is the x,y of the adjacent tile in chosen direction
        adj = (x+x_d, y+y_d)
        if adj[0]<x_min or adj[0] >= x_max:
            continue
        if adj[1]<y_min or adj[1] >= y_max:
            continue
        if adj in cleared or adj in blocked:
            # If the adjacent tile was already hit by an overlapping pass
            continue
        # Block the adjacent tile if two or more of it's neighbors is clear
        # Might want to tinker with this to stop 1x1 spurs
        adj_cleared = 0
        for (x_d2, y_d2) in vectors:
            adj2 = (adj[0]+x_d2, adj[1]+y_d2)
            if adj2 == (x,y):
                continue
            if adj2 in cleared:
                blocked.append(adj)
                break
        else:
            open.append(adj)
       

    # Pick a next move
    if open == []:
        offset += 1
        if offset > len(cleared):
            break
        x,y=cleared[-offset]
    else:
        offset = 0
        x,y=random.choice(open)

# make path objects and store them
for x,y in cleared:
    p = Path(x=x,y=y)
    if (x+1,y) in cleared: p.u = True
    if (x-1,y) in cleared: p.d = True
    if (x,y-1) in cleared: p.l = True
    if (x,y+1) in cleared: p.r = True
    Session.add(p)
Session.commit()
dump_maze()
