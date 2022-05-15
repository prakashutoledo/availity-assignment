# availity-assignment
Availity's FullStack Homework Assignment
[![CI](https://github.com/prakashutoledo/availity-assignment/actions/workflows/gradle-npm.yml/badge.svg)](https://github.com/prakashutoledo/availity-assignment/actions/workflows/gradle-npm.yml) 
[![Coverage](.github/badges/jacoco.svg)](https://github.com/prakashutoledo/availity-assignment/actions/workflows/gradle-npm.yml)
![Branches](.github/badges/branches.svg)

# Getting Started 

A multi-project gradle project with 3 subprojects listed below
* [csv-enrollment-processor](/csv-enrollment-processor) A `gradle` project which helps to process enrollment files in CSV format
* [lisp-parenthesis-validator](/lisp-parenthesis-validator) A `gradle` project which validates Lisp code parenthesis are enclosed
* [registration-user-interface)](/registration-user-interface) A `React` application with `gradle` tasks to support `npm` tasks which register users

Project were written using `Java` with tests written in `Groovy` using `Spock and Junit-5`. 
React application is written using `TypeScript` with test using `Jest`

## Available Scripts

In the project directory, you can run:

### `./gradlew test`

This will run test in all subprojects. For react application `CI=true npm run test` which doesn't launch watcher

### `./gradlew clean`

This will clean all builds for all subprojects. For react application it will also delete `node_modules`

### `./gradlew build`

This will build all subprojects and, also run `npm install` followed by `npm run build` for react application

### Working Sample

A sample of react application for project [registration-user-interface](/registration-user-interface) is hosted in AWS S3
which can be access by [https://registration-form.s3.us-east-2.amazonaws.com/index.html](https://registration-form.s3.us-east-2.amazonaws.com/index.html)
