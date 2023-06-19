# TeamMeet Backend

## Description

This is the backend for the TeamMeet application. It is a REST API built using Node.js, Express.js, and MongoDB.

## Installation

1. Clone the repository

git clone https://github.com/DoEasy23/expressTeammeet

2. Install dependencies

npm install

3. Run the server

nodemon index.js

## Usage

### Register a user

POST /api/auth/signup

Request body:

```
{
    "username": "username",
    "email": "email",
    "password": "password"
}
```

### Login a user

POST /api/auth/login

Request body:

```
{
    "email": "email",
    "password": "password"
}
```

### Create a meeting

POST /api/events

Request body:

```
{
    "title": "title",
    "description": "description",
    "date": "date",
    "location": "location",
    "sport": "sport",
    "creator": "creator"
}
```

### Get all meetings

GET /api/events

### Get a meeting by id

GET /api/events/:id

### Update a meeting

PUT /api/events/:id

Request body:

```
{
    "title": "title",
    "description": "description",
    "date": "date",
    "location": "location",
    "sport": "sport",
    "creator": "creator"
}
```

### Delete a meeting

DELETE /api/events/:id

### Get a user by id

GET /api/auth/:id

## Contributors

- [Burak Coşkun](https://github.com/retr0senss)
- [Oğuz Koyuncuoğlu](https://github.com/DoEasy23)

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Oğuz Koyuncuoğlu - muhammedoguzkoyuncuoglu@gmail.com

Burak Coşkun - burakcoskun832@gmail.com
