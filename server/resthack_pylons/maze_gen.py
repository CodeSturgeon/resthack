#!/usr/bin/env python
import random
from optparse import OptionParser

def dump_maze(width, height, cleared):
    print '#'*(width+2)
    for sy in range(height):
        tiles = ['#']
        for sx in range(width):
            if (sx,sy) == cleared[0]:
                tiles.append('S')
            elif (sx,sy) == cleared[-1]:
                # Last cleared location
                tiles.append('F')
            elif (sx,sy) in cleared:
                tiles.append(' '),
            else:
                tiles.append('X')
        tiles.append('#')
        print ''.join(tiles)
    print '#'*(width+2)

def make_maze(width,height):
    # Four basic direction vectors
    vectors = [(1,0),(0,1),(-1,0),(0,-1)]
    # Backtracking offset
    offset = 0
    # Set initial location
    x=y=0
    # Define maze size
    x_max=width
    y_max=height
    x_min=y_min=0
    # Setup tracking lists
    cleared=[]
    blocked=[]
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
    return cleared

def save(name, width, height, cleared):
    from paste.deploy import appconfig
    from pylons import config

    from resthack.model import Tile, Maze
    from resthack.model.meta import Session

    from resthack.config.environment import load_environment

    conf = appconfig('config:development.ini', relative_to='.')
    load_environment(conf.global_conf, conf.local_conf)

    # make maze
    maze = Maze(name=name,width=width,height=height)
    # make tile objects and store them

    for x,y in cleared:
        shape = 0
        if (x,y-1) in cleared: shape += 1
        if (x+1,y) in cleared: shape += 2
        if (x,y+1) in cleared: shape += 4
        if (x-1,y) in cleared: shape += 8
        Session.add(Tile(x=x, y=y, shape=shape, maze=maze))
    Session.commit()

def get_options():
    parser = OptionParser()
    parser.add_option('-x', '--width', type='int', default=40)
    parser.add_option('-y', '--height', type='int', default=20)
    parser.add_option('-n', '--dry-run', action='store_true')
    parser.add_option('-q', '--quiet', action='store_true')
    return parser.parse_args()

def main():
    opts, args = get_options()
    for name in args:
        cleared = make_maze(opts.width,opts.height)
        if not opts.dry_run:
            save(name, opts.width, opts.height, cleared)
        if not opts.quiet:
            print '--%s--'%name
            dump_maze(opts.width, opts.height, cleared)

if __name__ == '__main__':
    main()
