## Live

https://plantz-nextjs.vercel.app/

## Featuring

-   NextJS page routing
-   NextJS API
-   NextJS server side rendering for initial load (no spinner)
-   NextJS route based routing for Modal
-   NextJS isomorphic models & validation schemas
-   NextJS with a virtualized list
-   react-query basic fetch & cache
-   react-query parameterized fetch & cache entry
-   react-query infinite scrolling
-   react-query prefetch
-   react-query cache invalidation
-   react-query optimistic updates
-   react-query automatic retry on fetch & update error
-   react-query in-form error handling
-   react-query & error boundary + reset support
-   react-query automatic refresh on window focus
-   Next-auth Google authentication
-   Next-auth MongoDb
-   Next-auth authentified middleware
-   Next-auth extends session user object with custom data
-   MongoDb client for Nodejs

## Installation

`yarn install` then `yarn dev` to start the app in development mode.

Create a `.env.local` file and set the set [environment variables](#environment-variables).

## Environment variables

Locally or hosted, create the following environnement variables:

-   `MONGODB_URI`: Make sure you set the default database to "plantz" in the URI (required for next-auth mongodb adapter). Ex: mongodb+srv://USER:PASSWORD@clusterX.mongodb.net/plantz
-   `MONGODB_DB`: Ex. plantz
-   `GOOGLE_CLIENT_ID`: https://console.cloud.google.com/apis/credentials
-   `GOOGLE_SECRET`: https://console.cloud.google.com/apis/credentials
-   `NEXTAUTH_URL`: Ex. http://localhost:3000
-   `NEXTAUTH_SECRET`: Anything you want

### Database

You can update the Mongo Database config in the `.env.local` file.

When you'll sign up for the first time, you'll have the opportunity to generate fake data.

## Learnings

View the [LEARNINGS](/learnings) file.
