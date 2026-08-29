# EduCore Testing Strategy

The project uses layered testing so that business rules and API behavior can be verified independently.

## Unit-Level Testing

Validate isolated application logic, schemas, security helpers, and model behavior where practical.

## API Testing

Verify:

- successful authentication
- protected endpoints
- validation failures
- authorization failures
- CRUD behavior
- relationship/enrollment behavior
- attendance operations
- grade operations
- appropriate HTTP status codes

## Integration Testing

Integration tests should run against a PostgreSQL service in CI so database-dependent behavior is exercised in an environment closer to deployment.

## CI

The repository CI workflow installs dependencies, starts PostgreSQL, compiles the backend, and verifies that the FastAPI application imports successfully.

## Quality Principle

Tests should verify observable behavior rather than implementation details. New features should add or update tests for their important success and failure paths.
