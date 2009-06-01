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


class Tile(_Base):
    __tablename__ = 'tiles'
    id = sa.Column(sa.types.Integer, primary_key=True)
    x = sa.Column(sa.types.Integer)
    y = sa.Column(sa.types.Integer)

class Map(_Base):
    __tablename__ = 'maps'
    id = sa.Column(sa.types.Integer, primary_key=True)
    name = sa.Column(sa.types.String(5))
    x_min = sa.Column(sa.types.Integer)
    x_max = sa.Column(sa.types.Integer)
    y_min = sa.Column(sa.types.Integer)
    y_max = sa.Column(sa.types.Integer)
