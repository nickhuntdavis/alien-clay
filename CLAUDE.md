# CLAUDE.md - AI Assistant Guide for alien-clay

This document provides comprehensive guidance for AI assistants (like Claude) working on the alien-clay project. It covers codebase structure, development workflows, conventions, and best practices.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Development Environment](#development-environment)
4. [Git Workflow](#git-workflow)
5. [Code Conventions](#code-conventions)
6. [Testing Strategy](#testing-strategy)
7. [AI Assistant Guidelines](#ai-assistant-guidelines)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Project Name:** alien-clay
**Repository:** nickhuntdavis/alien-clay
**Status:** New/In Development

### Purpose
[To be filled: Brief description of what this project does and its primary goals]

### Key Technologies
[To be filled as project develops]
- Language(s):
- Framework(s):
- Build Tools:
- Testing Frameworks:
- Other Dependencies:

---

## Repository Structure

```
alien-clay/
├── .git/                  # Git repository data
├── CLAUDE.md             # This file - AI assistant guide
├── README.md             # [To be created] Project documentation
├── LICENSE               # [To be created] Project license
├── .gitignore            # [To be created] Git ignore rules
└── [Additional structure to be defined as project develops]
```

### Key Directories
[To be documented as the project structure develops]

---

## Development Environment

### Prerequisites
[To be documented]
- Required software and versions
- Environment variables
- Configuration files

### Setup Instructions

```bash
# Clone the repository
git clone [repository-url]
cd alien-clay

# [Additional setup steps to be documented]
```

### Environment Configuration
[Document any .env files, configuration requirements, or environment-specific settings]

---

## Git Workflow

### Branch Strategy

**Main Branch:** [To be determined - typically `main` or `master`]

**Branch Naming Conventions:**
- Feature branches: `feature/descriptive-name`
- Bug fixes: `fix/descriptive-name`
- AI assistant branches: `claude/claude-md-[session-id]`
- Hotfixes: `hotfix/descriptive-name`

### Commit Guidelines

**Commit Message Format:**
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat: add user authentication module

fix: resolve null pointer exception in data parser

docs: update API documentation for v2 endpoints
```

### Pull Request Process

1. **Create Feature Branch:** Branch from main/master
2. **Develop:** Make changes following code conventions
3. **Test:** Ensure all tests pass
4. **Commit:** Use conventional commit messages
5. **Push:** Push to remote branch
6. **PR:** Create pull request with description
7. **Review:** Address review comments
8. **Merge:** Merge after approval

---

## Code Conventions

### General Principles

1. **Clarity over Cleverness:** Write code that is easy to understand
2. **Consistency:** Follow existing patterns in the codebase
3. **Documentation:** Comment complex logic and public APIs
4. **Testing:** Write tests for new functionality
5. **Security:** Never commit secrets, credentials, or sensitive data

### Code Style

[To be defined based on project language and team preferences]

**Formatting:**
- Indentation: [tabs/spaces and size]
- Line length: [maximum characters]
- Naming conventions: [camelCase, snake_case, PascalCase, etc.]

**File Organization:**
- Imports/requires at top
- Constants after imports
- Main logic follows
- Helper functions at end or in separate modules

### Security Best Practices

- ✅ Use environment variables for sensitive configuration
- ✅ Validate and sanitize all user inputs
- ✅ Use parameterized queries to prevent SQL injection
- ✅ Implement proper authentication and authorization
- ✅ Keep dependencies updated
- ❌ Never commit API keys, passwords, or tokens
- ❌ Never log sensitive information
- ❌ Avoid eval() or similar dangerous functions

---

## Testing Strategy

### Test Structure
[To be defined]

### Running Tests
```bash
# [To be documented based on testing framework]
# Example: npm test, pytest, cargo test, etc.
```

### Test Coverage
[Document coverage goals and how to check coverage]

### Testing Guidelines

1. **Unit Tests:** Test individual functions/methods
2. **Integration Tests:** Test component interactions
3. **E2E Tests:** Test complete user workflows
4. **Test Naming:** Use descriptive names that explain what is being tested
5. **Test Independence:** Tests should not depend on each other

---

## AI Assistant Guidelines

### General Approach

When working on this project, AI assistants should:

1. **Understand First:** Read relevant code before making changes
2. **Plan Before Acting:** Use TodoWrite tool for multi-step tasks
3. **Be Conservative:** Prefer editing existing files over creating new ones
4. **Follow Patterns:** Match existing code style and architecture
5. **Verify Changes:** Test changes before committing
6. **Communicate Clearly:** Explain reasoning for decisions

### Tool Usage Recommendations

**For Exploration:**
- Use `Task` tool with `subagent_type=Explore` for broad codebase exploration
- Use `Grep` for searching specific patterns or keywords
- Use `Glob` for finding files by pattern

**For File Operations:**
- Use `Read` to understand existing code
- Use `Edit` for modifying existing files (preferred over Write)
- Use `Write` only when creating new files is necessary

**For Task Management:**
- Use `TodoWrite` for complex multi-step tasks
- Keep todos updated and mark completed immediately
- One task in_progress at a time

**For Git Operations:**
- Always check git status before committing
- Use descriptive commit messages
- Push to designated branch only

### Code Review Checklist

Before committing, verify:

- [ ] Code follows project conventions
- [ ] No security vulnerabilities introduced
- [ ] No secrets or sensitive data in code
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)
- [ ] No unnecessary files created
- [ ] Changes are minimal and focused
- [ ] Error handling is appropriate
- [ ] Edge cases are considered

### Common Pitfalls to Avoid

1. **Don't create unnecessary documentation:** Only create docs when explicitly requested
2. **Don't use emojis:** Unless explicitly requested by user
3. **Don't commit untracked files blindly:** Review what files are being added
4. **Don't make assumptions:** Ask for clarification when requirements are ambiguous
5. **Don't skip testing:** Always verify changes work as expected
6. **Don't push to wrong branch:** Always push to the designated feature branch

---

## Common Tasks

### Adding a New Feature

1. Create feature branch or use assigned branch
2. Plan implementation using TodoWrite
3. Implement feature following code conventions
4. Write tests for new functionality
5. Update documentation if needed
6. Commit with descriptive message
7. Push to remote branch
8. Create pull request

### Fixing a Bug

1. Reproduce the bug
2. Identify root cause
3. Write test that exposes the bug (if applicable)
4. Implement fix
5. Verify test passes
6. Commit with fix message
7. Push and create PR

### Refactoring Code

1. Understand current implementation
2. Ensure tests exist for current behavior
3. Make incremental changes
4. Run tests after each change
5. Commit frequently with clear messages
6. Document any API changes

### Adding Documentation

1. Identify what needs documentation
2. Write clear, concise documentation
3. Include examples where helpful
4. Update relevant README or docs
5. Commit with docs message

---

## Troubleshooting

### Common Issues

**Issue:** Git push fails with 403 error
**Solution:** Ensure branch name starts with 'claude/' and ends with matching session ID

**Issue:** Tests failing after changes
**Solution:** Review test output, check for breaking changes, update tests if API changed intentionally

**Issue:** Merge conflicts
**Solution:** Fetch latest from main, resolve conflicts carefully, test thoroughly

**Issue:** Can't find specific code/functionality
**Solution:** Use Explore agent for broad searches, Grep for specific patterns

### Getting Help

[Document how to get help - team contacts, documentation links, etc.]

---

## Project-Specific Notes

[This section should be updated as the project develops with any project-specific conventions, gotchas, or important information]

### Architecture Decisions
[Document key architectural decisions and rationale]

### Dependencies Management
[Document how dependencies are managed and updated]

### Deployment
[Document deployment process when established]

### Performance Considerations
[Document any performance requirements or optimization strategies]

---

## Changelog

This document should be updated as the project evolves.

**Version History:**
- 2025-11-15: Initial creation - Comprehensive guide for new repository
- [Future updates to be logged here]

---

## Additional Resources

[Links to additional documentation, external resources, etc.]

- Project README: [To be created]
- API Documentation: [If applicable]
- Team Wiki: [If applicable]
- Issue Tracker: GitHub Issues

---

**Last Updated:** 2025-11-15
**Maintained By:** AI Assistants working on alien-clay project

**Note to Future AI Assistants:** Please keep this document updated as you learn more about the project structure, conventions, and workflows. This living document should reflect the current state of the project.
