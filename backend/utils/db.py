# BoxDesign AI — Database Connection
# SQLite used for dev. Set DATABASE_URL=postgresql://... in .env for production.

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from contextlib import contextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./boxdesignai_dev.db")

# Use SQLite for dev (no install needed), PostgreSQL for production
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=os.getenv("DEBUG", "false").lower() == "true",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Note: Models should inherit from this Base or the Base defined in models.user
# to be included in the same metadata. For this project, we recommend 
# importing this Base into your model files.
Base = declarative_base()

def get_db():
    """FastAPI dependency — yields DB session, closes on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables. Call on app startup."""
    # Importing models here ensures they are registered with the Base's metadata
    # before create_all is called.
    from models.user import User
    from models.design import DesignRequest, GeneratedDesign
    from models.order import Order
    
    # We use the metadata from models.user.Base if models inherit from there,
    # or Base.metadata if they inherit from the local Base.
    # To be safe and follow the prompt's structure:
    from models.user import Base as ModelBase
    ModelBase.metadata.create_all(bind=engine)
    
    # Also create for the local Base in case any models used it
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    # Can be run directly to initialize the database
    create_tables()
    print("Database tables created successfully.")
