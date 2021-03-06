# availity-assignment [![CI](https://github.com/prakashutoledo/availity-assignment/actions/workflows/gradle-npm.yml/badge.svg)](https://github.com/prakashutoledo/availity-assignment/actions/workflows/gradle-npm.yml) [![lisp-parenthesis-validator-coverage](.github/jacoco-badges/lisp-parenthesis-validator-coverage.svg)](https://github.com/prakashutoledo/availity-assignment/actions/workflows/gradle-npm.yml) [![lisp-parenthesis-validator-coverage-branches](.github/jacoco-badges/lisp-parenthesis-validator-branches.svg)](https://github.com/prakashutoledo/availity-assignment/actions/workflows/gradle-npm.yml) [![csv-enrollment-processor-coverage](.github/jacoco-badges/csv-enrollment-processor-coverage.svg)](https://github.com/prakashutoledo/availity-assignment/actions/workflows/gradle-npm.yml) [![csv-enrollment-processor-branches](.github/jacoco-badges/csv-enrollment-processor-branches.svg)](https://github.com/prakashutoledo/availity-assignment/actions/workflows/gradle-npm.yml)

Availity's FullStack Homework Assignment

# Getting Started 

A multi-project gradle project with 3 subprojects listed below
* [csv-enrollment-processor](/csv-enrollment-processor) A `gradle` project which helps to process enrollment files in CSV format
* [lisp-parenthesis-validator](/lisp-parenthesis-validator) A `gradle` project which validates Lisp code parenthesis are enclosed
* [registration-user-interface](/registration-user-interface) A `React` application with `gradle` tasks to support `npm` tasks which register users

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

### Candidate Response Answer

My response for the asked question can be found in Microsoft Word Document [response](/response/Khadka_Prakash_Response.docx)

### Github Workflow

This project supports github workflow to run test, build all projects and deploy react production build to AWS S3

### Working Sample

A sample of react application for project [registration-user-interface](/registration-user-interface) is hosted in AWS S3
which can be access by [https://registration-form.s3.us-east-2.amazonaws.com](https://registration-form.s3.us-east-2.amazonaws.com/index.html)
