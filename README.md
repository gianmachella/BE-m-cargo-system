# M-Cargo System — Backend

REST API backend for a logistics and shipment-management system. Powers shipment tracking, batching, and invoicing for a live logistics operation, paired with the companion frontend (FE-m-cargo-system).

## Tech Stack

Node.js with Express. Sequelize ORM on MySQL. JSON Web Tokens (jsonwebtoken) for authentication and bcryptjs for password hashing. express-validator for request validation. Resend for transactional email. CORS and dotenv for configuration.

## Architecture

The API follows a standard MVC-style layout: controllers handle request logic, models define the Sequelize schema, routes expose the REST endpoints, and middlewares handle auth and validation. Email notifications are generated from templates in emailTemplate.

## Deployment

Deployed to production on AWS EC2, managed with PM2, behind an NGINX reverse proxy.

## Available Scripts

npm start runs the server with node. npm run dev runs it with nodemon for local development.
