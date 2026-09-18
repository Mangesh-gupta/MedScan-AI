from app.database.session import engine, Base
import app.models # register models

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized.")

if __name__ == "__main__":
    init_db()
