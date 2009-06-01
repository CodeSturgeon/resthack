"""Setup the resthack application"""
import logging

from resthack.config.environment import load_environment
from resthack import model
from resthack.model import meta

log = logging.getLogger(__name__)

def setup_app(command, conf, vars):
    """Place any commands to setup resthack here"""
    load_environment(conf.global_conf, conf.local_conf)

    # Create the tables if they don't already exist
    model._Base.metadata.create_all(bind=meta.engine)
