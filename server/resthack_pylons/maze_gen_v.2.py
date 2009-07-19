#!/usr/bin/env python
from paste.deploy import appconfig
from pylons import config

from resthack.model import Thing
from resthack.model.meta import Session

from resthack.config.environment import load_environment

conf = appconfig('config:development.ini', relative_to='.')
load_environment(conf.global_conf, conf.local_conf)

import Image
maze = Image.open('/Users/fish/Projects/image_eater/output/bender.jpg')

(width, height) = maze.size

for y in range(height):
    line = []
    for x in range(width):
        if sum(maze.getpixel((x,y))) > 700:
            line.append(' ')
        elif sum(maze.getpixel((x,y))) < 300:
            line.append('#')
            w = Thing(x=x,y=y,type='wall2')
            Session.add(w)
        else:
            line.append('X')
            w = Thing(x=x,y=y,type='wall1')
            Session.add(w)
    print ''.join(line)

Session.commit()
