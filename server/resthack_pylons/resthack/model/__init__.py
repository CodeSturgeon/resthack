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

class Map(_Base):
    __tablename__ = 'maps'
    id = sa.Column(sa.types.Integer, primary_key=True)
    name = sa.Column(sa.types.String(5), nullable=False)
    x_min = sa.Column(sa.types.Integer, nullable=False)
    x_max = sa.Column(sa.types.Integer, nullable=False)
    y_min = sa.Column(sa.types.Integer, nullable=False)
    y_max = sa.Column(sa.types.Integer, nullable=False)

class Tile(_Base):
    __tablename__ = 'tiles'
    id = sa.Column(sa.types.Integer, primary_key=True)
    map_id = sa.Column(sa.types.Integer, sa.ForeignKey('maps.id'),
                        nullable=False)
    x = sa.Column(sa.types.Integer, nullable=False)
    y = sa.Column(sa.types.Integer, nullable=False)
    type = sa.Column(sa.types.String(5), nullable=False)
    map = orm.relation(Map, backref=orm.backref('tiles', order_by=x))
