# EduCore Non-Functional Requirements

**Intern:** Yishak Tule  
**Organization:** Sidam Science and Technology Agency  
**Location:** Hawassa, Ethiopia

## Security

- Passwords must never be stored as plain text.
- Protected API resources require authentication.
- Authorization must be checked before privileged operations.
- Production secrets must be supplied through environment configuration.

## Performance

- List endpoints should support pagination rather than loading unbounded datasets.
- Database queries should use appropriate relationships and filtering rather than unnecessary application-side processing.

## Reliability

- Invalid input should produce clear validation errors.
- Database failures should be surfaced with appropriate HTTP status codes.
- Production startup should not depend on demo data generation.

## Maintainability

- Backend and frontend responsibilities should remain separated.
- Configuration should be environment-driven.
- Features should be documented alongside implementation.
- Automated checks should run through the repository's CI workflow.

## Usability

- The frontend should provide clear navigation and understandable forms.
- Loading, empty, success, and error states should be distinguishable.
- The interface should remain usable on common desktop and mobile screen sizes.
