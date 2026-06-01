# FastAPI Application Entry Point
# This is the main entry point for the School Management System backend.
# Responsibilities:
#   - Instantiate the FastAPI app with title, version, and description
#   - Configure CORS middleware using allowed origins from settings
#   - Register all API routers from app/api/routes/ under the /api/v1 prefix
#   - Add global exception handlers for validation errors and HTTP exceptions
#   - Include startup/shutdown event handlers (e.g., DB connection pool init)
# Run with: uvicorn main:app --reload
