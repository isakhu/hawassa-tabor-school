# Announcement ORM Model
# This module will define the SQLAlchemy ORM model for the `announcements` table.
# Fields will include:
#   id (UUID), title, body, author_id (FK → users),
#   audience (enum: all | admin | teacher | student),
#   is_active, published_at, expires_at, created_at
# Relationships:
#   - belongs_to User (the author)
