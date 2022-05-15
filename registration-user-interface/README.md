# Getting Started with Registration User Interface
This project provides sample user interface for registration using material UI.
Once user submits the request, requests is route to AWS ApiGateway mock post api which returns 
the request id into a modal window.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified, and the filenames include the hashes.\
Your app is ready to be deployed!

## If you prefer gradle tasks

Script must run from root parent project [availity-assignment](..)

### `./gradlew test` or `./gradlew :registration-user-interface:test`

This will run `npm run test` but in non-interactive CI mode

### `./gradlew bundle` or `./gradlew :registration-user-interface:bundle`

This will clean the previous build and run `npm run build`

### `./gradlew start` or `./gradlew :registration-user-interface:start`

This will run `npm start` in development mode

### Working Sample

[https://registration-form.s3.us-east-2.amazonaws.com/index.html](https://registration-form.s3.us-east-2.amazonaws.com/index.html)