## Live

https://plantz-nextjs-gov3xpho1-patricklafrance.vercel.app/

## Featuring

-   NextJS page routing
-   NextJS API
-   NextJS server side rendering for initial load (no spinner)
-   NextJS route based routing for Modal
-   NextJS isomorphic models & validation schemas
-   react-query basic fetch & cache
-   react-query parameterized fetch & cache entry
-   react-query complex fetch \* cache for infinite scrolling
-   react-query prefetch
-   react-query cache invalidation
-   react-query optimistic updates
-   react-query automatic retry on fetch & update error
-   react-query in-form error handling
-   react-query & error boundary + reset support
-   react-query automatic refresh on window focus
-   MongoDb client for Nodejs

## Installation

`yarn install` then `yarn dev` to start the app in development mode.

### Database

You can update the Mongo Database config in the `.env.local` file.

If the database is empty you can seed the data and the create the search index by making a GET request to `/api/db/seed`. By default, the seed will generate a small custom dataset. To generate 10 pages of fake data, add the `fake` query parameter, e.g `/api/db/seed?fake=true`. The number of pages is configurable, by adding the `pageCount` query parameter, e.g: `/api/db/seed?fake=true&pageCount=2`.

Once the seeding is completed, the GET request will return. You can also see the seeding progress in your dev process console.

## Learnings

View the [LEARNINGS](/learnings) file.
