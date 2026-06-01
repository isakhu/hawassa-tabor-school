# Database Configuration
# This module will set up the SQLAlchemy async engine and session factory
# for connecting to the PostgreSQL database.
# Responsibilities:
#   - Create the async engine using DATABASE_URL from config
#   - Define the declarative Base class that all ORM models will inherit from
#   - Provide the async_session factory used by the get_db() dependency
#   - Export a create_all_tables() utility for initial schema creation (dev only)
