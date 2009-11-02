"""The application's model objects"""
import sqlalchemy as sa
from sqlalchemy import orm
from sqlalchemy.ext.declarative import declarative_base

from resthack.model import meta

_Base = declarative_base()

def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    meta.Session.configure(bind=engine)
    meta.engine = engine

class Maze(_Base):
    __tablename__ = 'mazes'
    id = sa.Column(sa.types.Integer, primary_key=True)
    name = sa.Column(sa.types.String(10), nullable=False, unique=True)
    width = sa.Column(sa.types.Integer, nullable=False)
    height = sa.Column(sa.types.Integer, nullable=False)
    def __repr__(self):
        return '<Maze %d (%d,%d)>'%(self.name,self.width,self.height)
    def serial(self):
        return {'name':self.name,'width':self.width,'height':self.height}

class Tile(_Base):
    __tablename__ = 'tiles'
    id = sa.Column(sa.types.Integer, primary_key=True)
    maze_id = sa.Column(sa.types.Integer, sa.ForeignKey('mazes.id'),
                        nullable=False)
    x = sa.Column(sa.types.Integer, nullable=False)
    y = sa.Column(sa.types.Integer, nullable=False)
    shape = sa.Column(sa.types.Integer, nullable=False)
    maze = orm.relation(Maze, backref=orm.backref('tiles', order_by=x))
    def __repr__(self):
        return '<Tile %d (%d,%d-%d)>'%(self.maze.name,self.x,self.y,self.shape)
    def serial(self):
        return {'x':self.x,'y':self.y,'shape':self.shape}

class Avatar(_Base):
    __tablename__ = 'avatars'
    id = sa.Column(sa.types.Integer, primary_key=True)
    name = sa.Column(sa.types.String(10), nullable=False, unique=True)
    x = sa.Column(sa.types.Integer, nullable=False)
    y = sa.Column(sa.types.Integer, nullable=False)
    maze_id = sa.Column(sa.types.Integer, sa.ForeignKey('mazes.id'),
                        nullable=False)
    maze = orm.relation(Maze, backref=orm.backref('avatars', order_by=name))
    def __repr__(self):
        return '<Avatar %d (%d,%d)>'%(self.id,self.x,self.y)
    def serial(self):
        return {'name':self.name,'x':self.x,'y':self.y}
