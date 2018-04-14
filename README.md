# Pour

[![CircleCI](https://circleci.com/gh/th3rdwave/pour.svg?style=svg)](https://circleci.com/gh/th3rdwave/pour)

### Simple CI tool for yarn based monorepos

The goal of this project is to simplify running tests and deploying projects in a monorepo. It tracks changed files to rebuild, test and deploy only if a project, or one of its dependency has changed.

## Install

```
npm i -g @th3rdwave/pour
```

## Usage

```
pour [options]

Options:

  -v, --version      output the version number
  -r, --root [path]  The root directory of the monorepo, relative to the cwd.
  -m, --meta [path]  Directory where metadata about changed files is saved.
  -h, --help         output usage information
```

## TODO

* Figure out a good way to leverage native CI parallelism features (CircleCI jobs, Buildkite pipelines).

* Use `workspaces` field used by yarn workspaces instead of custom projects config. This would give us the list of all projects and we could deduce dependencies by looking at each individual project's package.json dependencies.

* CircleCI example

* Not sure if it is a non-goal or not but make it less yarn specific and support different commands.
