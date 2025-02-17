# TechTornadoV2

TechTornadoV2 is a quiz-based game application built with Node.js, Express, and MongoDB.

## Project Structure
```
TechTornadoV2
└── TechTornadoV2
    └── server
        ├── config
        │   ├── Database.js
        │   └── socket.js
        ├── controllers
        │   ├── adminController.js
        │   ├── gameController.js
        │   └── teamController.js
        ├── middleware
        │   ├── auth.js
        │   └── validateRequest.js
        ├── models
        │   ├── Admin.js
        │   ├── gameState.js
        │   ├── Question.js
        │   └── Team.js
        ├── routes
        │   ├── adminRoutes.js
        │   ├── gameRoutes.js
        │   └── teamRoutes.js
        ├── services
        │   ├── adminService.js
        │   ├── gameService.js
        │   └── teamService.js
        ├── utils
        │   ├── helpers.js
        │   ├── logger.js
        │   └── notFoundHandler.js
        ├── .env
        ├── app.js
        ├── package-lock.json
        ├── package.json
        └── server.js
```

## Installation
```bash
git clone https://github.com/yourusername/TechTornadoV2.git
cd TechTornadoV2/server
npm install
```

## Environment Setup
Create a `.env` file in the `server` directory:
```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
PORT=8000
```

## Run the Server
```bash
npm start
```

## API Documentation
See the [API Documentation](#) for detailed information on all available endpoints.

## License
This project is licensed under the MIT License.

