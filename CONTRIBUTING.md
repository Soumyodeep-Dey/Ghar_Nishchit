# Contributing to Ghar Nishchit

Thank you for your interest in contributing to **Ghar Nishchit**!
We welcome all kinds of contributions — bug fixes, new features, documentation improvements, and more.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Style Guide](#style-guide)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).
Please read it before contributing.

---

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/ChandraVerse/Ghar_Nishchit/issues/new) and include:

- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs. actual behaviour
- Screenshots or logs if applicable
- Your environment: OS, Node.js version, browser

### Suggesting Features

Have an idea? [Open a feature request](https://github.com/ChandraVerse/Ghar_Nishchit/issues/new) with the label `enhancement` and describe:

- The problem you are solving
- Your proposed solution
- Any alternatives you have considered

### Improving Documentation

Documentation fixes, typo corrections, and clarifications are always welcome — no issue needed for small changes.

### Submitting Code

For anything beyond a trivial fix, please **open an issue first** to discuss the change before investing time in a PR.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
   ```bash
   git clone https://github.com/your-username/Ghar_Nishchit.git
   cd Ghar_Nishchit
   ```
3. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Set up the project** by following the [Getting Started](./README.md#getting-started) guide in the README
5. **Make your changes**, then commit and push
6. **Open a Pull Request** targeting the `main` branch

---

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer]
```

| Type | When to Use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code refactoring without feature or bug changes |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates, tooling |
| `perf` | Performance improvements |

**Examples:**
```bash
git commit -m "feat(auth): add Google OAuth login"
git commit -m "fix(maintenance): resolve status not updating on PATCH"
git commit -m "docs: update API endpoint table in README"
```

---

## Pull Request Guidelines

- **One feature or fix per PR** — keep it focused
- **Link the related issue** in the PR description using `Closes #issue-number`
- **Fill out the PR template** completely
- Ensure your branch is **up to date** with `main` before opening a PR
- All PRs must pass **linting checks** (ESLint + Prettier) before merging
- Be **responsive** to review feedback — PRs inactive for 14 days may be closed

---

## Development Setup

See the full setup guide in [README.md - Getting Started](./README.md#getting-started).

**Quick reference:**

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend/UI && npm install && npm run dev
```

---

## Style Guide

- **Backend**: ES Modules (`import`/`export`), formatted with **Prettier** (`npm run format`)
- **Frontend**: React functional components with hooks, styled with **Tailwind CSS**
- Avoid committing console logs or debug statements
- Keep functions small and single-purpose
- Use descriptive variable and function names

---

Thank you for helping make **Ghar Nishchit** better for renters and landlords across India.
