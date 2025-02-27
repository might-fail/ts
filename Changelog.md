# Changelog

All notable changes to this project will be documented in this file.

## [0.7.4] - 2025-02-27

### Added

#### `build.ts`
- .cjs extension to CommonJS output files
- a plugin to fix require() statements to reference .cjs files

### Changed
- The build process for npm uses a build.ts file to build the project with esbuild. This gives esm js files the .js extension which is needed for some environments.


## [0.7.3] - 2024-12-11

### Changed
- Fixed the error type to make it more generic and consistent with TS: https://github.com/might-fail/ts/issues/20

## [0.7.2] - 2024-11-30

### Changed
- Removed `NotUndefined` type. https://github.com/might-fail/ts/issues/20

## [0.7.0] - 2024-10-27


### Changed
- The either type now accepts type without promise and returns the awaited type.

## [0.6.3] - 2024-10-6

### Added
- `build.ts` to build the project with esbuild

### Changed
- the build process for npm uses a build.ts file to build the project with esbuild. This gives esm js files the .js extension which is needed for some environments.


## [0.6.1] - 2024-10-6

### Added
- `Might` and `Fail` functions
- new docs page in the readme

### Changed
- `mightFail` and `mightFailSync` now return an object tuple so you can destructure it as an object or a tuple, your choice.
- removed the `/tuple` folder since the normal `might-fail` import will work the same.



## [0.5.0] - 2024-10-2

### Added
- `mightFail.any` support
- `mightFail.race` support
- `mightFail.all` support
- `mightFail.allSettled` support


## [0.4.0] - 2024-09-29

### Added
- `/go` folder for a Go-style tuple implementation. `const [result, error] = mightFail(promise)`
- `/tuple` folder for a tuple implementation. `const [error, result] = mightFail(promise)`

### Changed
- If a function throws a string, the string will be the message of the new Error object.
- If a function throws an object with a message property, the message will be the message of the new Error object.
- If a function throws an object it will be passed to the Error object constructor as is.

## [0.3.0] - 2024-03-16

### Added
- Support for synchronous error handling with `mightFailSync` and `makeMightFailSync` functions.
- A new `publish` script in `package.json` to streamline the build and publish process.

### Changed
- The library now officially supports both async and sync error handling. This change is reflected in the README to emphasize the library's versatility in handling errors in different contexts.
- Updated `Either.ts` to streamline the type definition for a more straightforward implementation.

## [0.1] - [0.2]


### Added
- Initial support for async error handling with `mightFail` and `makeMightFail` functions.
- Comprehensive documentation in the README, illustrating the use of the library with practical examples.
- Implementation of the `Either` type to support the async error handling pattern.

### Changed
- Various internal improvements for better performance and reliability.
