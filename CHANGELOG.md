# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-01-11

### Changed

- **BREAKING**: Migrated from public NPM to private GitHub Packages
- **BREAKING**: Changed package name from `@traffic.by.intent/gaql-builder` to
  `@txi-dev/gaql-builder`
- **BREAKING**: Parameters now only accept `boolean` and `number` types (no strings) for security
- Refactored `build()` method for better maintainability and reduced complexity
- Improved error messages with standardized format: "Expected: X, Received: Y"

### Added

- Custom error types for better error handling:
  - `ValidationError` for input validation failures
  - `QueryBuildError` for query construction errors
  - `SecurityError` for security violations
  - `QueryLimitError` for size limit violations
- Query size limits to prevent memory exhaustion attacks:
  - Maximum 500 SELECT fields
  - Maximum 100 WHERE conditions
  - Maximum 50 parameters
  - Maximum 1000 values in IN/CONTAINS clauses
  - Maximum 100KB total query size
- ReDoS (Regular Expression Denial of Service) protection for REGEXP_MATCH patterns
- Support for custom date ranges in YYYY-MM-DD format in `whereDuring()`
- Comprehensive GitHub Packages authentication guide (GITHUB_PACKAGES_AUTH.md)
- Additional test suites for security, limits, ReDoS, and date ranges (137 total tests)
- 100% test coverage across all files

### Security

- Fixed critical parameter injection vulnerability by restricting parameter types
- Added validation for regex pattern complexity to prevent ReDoS attacks
- Implemented query size limits to prevent memory exhaustion
- Enhanced field name and resource name validation

### Infrastructure

- Updated GitHub Actions workflows for GitHub Packages publishing
- Added permissions configuration for package access in CI/CD
- Configured .npmrc for GitHub Packages registry

## [0.2.0] - Previous Release

### Added

- Added GROUP BY clause support for aggregation queries
- Added support for aggregate functions (SUM, COUNT, AVG, MIN, MAX, COUNT_DISTINCT)
- Added GitHub Actions CI/CD workflows (ci.yml and release.yml)
- Added parameter security warning in README
- Added troubleshooting section to README
- Added `sideEffects: false` to package.json for better tree-shaking
- Added exports field to package.json for ESM support
- Exported GaqlValue and GaqlArrayValue types for consumer use
- Added 3 new tests for GROUP BY functionality (105 total tests)

### Changed

- Performance tests now use deterministic validation instead of time-based assertions
- Optimized Object.entries() usage to avoid duplicate calls
- Updated @trafficbyintent/style-guide to v1.1.10

### Fixed

- Fixed time-dependent performance tests that could fail on slower machines
- Fixed ESLint rule `@typescript-eslint/only-throw-error` compatibility issue

### Removed

- Removed unused devDependencies: google-ads-api (77MB) and long package

### Security

- Added comprehensive field name validation to prevent SQL injection in all WHERE methods
- Added pattern escaping for LIKE and REGEXP_MATCH clauses to prevent injection
- Added resource name validation in FROM clause
- Added parameter name validation in PARAMETERS clause
- Added date range validation in whereDuring to prevent SQL injection
- Added security documentation for parameter value handling

### Developer Experience

- Comprehensive code review completed identifying 15+ improvements
- Test quality review confirmed 100% meaningful coverage with no dynamic data
- Deep review identified and fixed critical dependency bloat issue (77MB reduction)

## [0.2.0] - 2025-08-01

### Added

- Integration with @trafficbyintent/style-guide for consistent code standards
- TypeScript type definitions for query values (GaqlValue, GaqlArrayValue)
- ESLint and Prettier configurations for automated code quality checks
- Comprehensive security tests for SQL injection and malicious input handling
- Concurrency tests to ensure multiple builder instances work independently
- Performance benchmarks for large query generation
- Internationalization tests for Unicode and emoji support
- Runtime validation for ORDER BY direction parameter
- Explicit public modifiers on all public methods

### Changed

- **BREAKING**: All `any` types replaced with proper TypeScript types (GaqlValue)
- Migrated from TypeScript `private` keyword to ES2022 private fields (#fieldName)
- Enhanced all error messages to include contextual information about invalid values
- Method return types changed from `GaqlBuilder` to `this` for better chaining support
- Improved code style compliance with TXI standards (arrow functions, comment style)
- Renamed `coverage.test.ts` to `edge-cases.test.ts` for clarity
- Excluded `index.ts` from test coverage metrics (pure re-export file)
- Updated string validation logic to be more precise

### Fixed

- Removed unnecessary empty constructor
- Corrected string boolean validation logic

### Developer Experience

- Added @trafficbyintent/style-guide as a dev dependency
- Configured linting to run automatically in prepublishOnly hook
- Achieved 100% test coverage with meaningful tests
- Removed contrived tests that existed only for coverage metrics

## [0.1.0] - 2025-07-22

### Added

- Initial implementation of GaqlBuilder class
- Support for all GAQL query clauses:
  - SELECT with field selection
  - FROM with resource specification
  - WHERE with multiple condition types
  - ORDER BY with ASC/DESC direction
  - LIMIT for result pagination
  - PARAMETERS for query parameterization
- Comprehensive WHERE clause operators:
  - Basic operators (=, !=, >, >=, <, <=)
  - IN and NOT IN for list matching
  - LIKE and NOT LIKE for pattern matching
  - NULL and NOT NULL checks
  - BETWEEN for range queries
  - CONTAINS ALL/ANY/NONE for array operations
  - DURING for date range queries
  - REGEXP_MATCH for regex patterns
- Method chaining support for fluent API
- TypeScript types and full type safety
- Comprehensive test suite with 100% coverage
- Consumer-focused README with examples
- MIT License

[Unreleased]: https://github.com/trafficbyintent/gaql-builder/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/trafficbyintent/gaql-builder/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/trafficbyintent/gaql-builder/releases/tag/v0.1.0
