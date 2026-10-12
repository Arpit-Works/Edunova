# Edunova

People Directory dashboard built with Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, and MongoDB Atlas.

Open the app, choose **People Directory**, and manage team members. Records are stored in the `edunova` database, `people` collection.

## Features

- List people with search, role filters, and team filters
- Add, edit, and delete members
- Profile photo preview, or a placeholder when no photo is set
- Loading, empty, and error states, including retry

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB Atlas cluster (or another MongoDB instance)

## Setup

```bash
npm install
```

Create a `.env` file in the project root. Do not commit it.

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
MONGODB_DB=edunova
```

`MONGODB_URI` is required. `MONGODB_DB` defaults to `edunova` when it is omitted.

## Scripts

```bash
npm run dev     # http://localhost:3000
npm run build
npm run start
npm run lint
```

Check the database connection at [http://localhost:3000/api/health](http://localhost:3000/api/health). A healthy response is `{ "status": "ok", "database": "connected" }`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Ping MongoDB |
| `GET` | `/api/people` | List people |
| `POST` | `/api/people` | Create a person |
| `GET` | `/api/people/:id` | Fetch one person |
| `PATCH` | `/api/people/:id` | Update a person |
| `DELETE` | `/api/people/:id` | Delete a person |

List search uses query parameters the API already supports:

```text
GET /api/people?search=amit&role=Backend%20Developer&team=Technology
```

`search` matches name, username, or email. The directory UI filters the loaded list in the browser so search and filters work together.

A person record looks like this:

```json
{
  "id": "mongo-object-id",
  "image": "/images/first.jpg",
  "name": "Amit Verma",
  "username": "@amitverma",
  "gender": "Male",
  "status": "Active",
  "role": "Backend Developer",
  "email": "amitverma@example.com",
  "teams": ["Technology"]
}
```

`teams` is one or more of `Design`, `Product`, `Marketing`, and `Technology`. `status` is `Active` or `Inactive`. Email must be unique. The API maps MongoDB `_id` to `id`.

## Project layout

```text
app/
  api/health/route.ts
  api/people/route.ts
  api/people/[id]/route.ts
  components/          UI (directory, form, filters, details)
  lib/mongodb.ts       MongoDB connection
  lib/api/people.ts    Browser API helpers
  lib/validations/people.ts
  people/Page.tsx      People Directory
types/person.ts
```
