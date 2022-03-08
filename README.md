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

-   `MONGODB_URI`
-   `MONGODB_DB`
-   `GOOGLE_CLIENT_ID`
-   `GOOGLE_SECRET`
-   `NEXTAUTH_URL`
-   `NEXTAUTH_SECRET`

### Database

You can update the Mongo Database config in the `.env.local` file.

If the database is empty you can seed the data and create the search index by making a GET request to `/api/db/seed`. By default, the seed will generate a small custom dataset. To generate 10 pages of fake data, add the `fake` query parameter, e.g `/api/db/seed?fake=true`. The number of pages is configurable, by adding the `pageCount` query parameter, e.g: `/api/db/seed?fake=true&pageCount=2`.

Once the seeding is completed, the GET request will return. You can also see the seeding progress in your dev process console.

TODO: Split the seed in 2 to create the search index independently of the seed data OR force the seed.

## Learnings

View the [LEARNINGS](/learnings) file.
