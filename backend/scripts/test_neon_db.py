import os
import sys
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL", "")
if len(sys.argv) > 1:
    db_url = sys.argv[1]

if not db_url or "localhost" in db_url:
    print("\n[!] Please provide your Neon connection string.")
    print("    Usage: python scripts/test_neon_db.py \"postgresql://neondb_owner:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require\"")
    print("    Or set DATABASE_URL in backend/.env\n")
    sys.exit(1)

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

print(f"Connecting to database endpoint: {db_url.split('@')[-1] if '@' in db_url else 'specified host'}...")

try:
    from sqlalchemy import create_engine, text
    connect_args = {"connect_timeout": 15}
    if "neon.tech" in db_url and "sslmode" not in db_url:
        connect_args["sslmode"] = "require"

    engine = create_engine(db_url, pool_pre_ping=True, pool_recycle=300, connect_args=connect_args)
    with engine.connect() as conn:
        res = conn.execute(text("SELECT version();")).fetchone()
        print("\n[SUCCESS] Connected to Neon PostgreSQL successfully!")
        print(f"Server version: {res[0]}\n")

        # Test table creation
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS _neon_connection_test (
                id SERIAL PRIMARY KEY,
                test_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        conn.commit()
        print("[SUCCESS] Verified read/write permissions on Neon database.")

        # Cleanup test table
        conn.execute(text("DROP TABLE IF EXISTS _neon_connection_test;"))
        conn.commit()
        print("[SUCCESS] Cleaned up temporary test table. Database is ready for DRAIN-X!\n")
except Exception as e:
    print(f"\n[ERROR] Connection failed: {e}\n")
    sys.exit(1)
