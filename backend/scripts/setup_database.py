import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from app.config import settings

def setup_postgresql_database():
    db_url = settings.DATABASE_URL
    print(f"[INFO] Configuring PostgreSQL Database from URL: {db_url}")

    # Step 1: Initialize tables using SQLAlchemy & app init_db
    try:
        from app.models.schema import init_db, SessionLocal, User
        from app.core.security import get_password_hash

        init_db()

        # Step 2: Seed initial users into PostgreSQL users table
        db = SessionLocal()
        try:
            if db.query(User).count() == 0:
                print("[INFO] Seeding initial user records into PostgreSQL 'users' table...")
                seed_users = [
                    User(
                        name="Dr. K. Radhakrishnan (Chief Disaster Controller)",
                        email="admin@drainx.gov.in",
                        password_hash=get_password_hash("Admin@123"),
                        role="admin"
                    ),
                    User(
                        name="Er. S. Anbarasu (Zonal Chief Engineer)",
                        email="user@chennaicorp.gov.in",
                        password_hash=get_password_hash("User@123"),
                        role="user"
                    ),
                    User(
                        name="Kavitha Raman",
                        email="citizen@chennai.in",
                        password_hash=get_password_hash("Citizen@123"),
                        role="user"
                    )
                ]
                db.add_all(seed_users)
                db.commit()
                print("[SUCCESS] Initial users seeded successfully into PostgreSQL!")
            else:
                print(f"[INFO] PostgreSQL 'users' table already contains {db.query(User).count()} user records.")
        finally:
            db.close()

    except Exception as e:
        print(f"[ERROR] Database initialization failed: {e}")

if __name__ == "__main__":
    setup_postgresql_database()
