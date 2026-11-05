from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

connect_args = {}
database_url = make_url(settings.DATABASE_URL)
if database_url.drivername == "sqlite":
    connect_args = {"check_same_thread": False}
    if database_url.database and not Path(database_url.database).is_absolute():
        database_url = database_url.set(
            database=str(
                (Path(__file__).resolve().parents[2] / database_url.database).resolve()
            )
        )
elif database_url.drivername.startswith("postgres"):
    database_url = database_url.set(drivername="postgresql+psycopg")

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300 if database_url.drivername.startswith("postgres") else -1
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
