# Installation

It is essential to setup the backend first

## Backend

Navigate to the backend directory and run:
npm install

Once everything is installed, you need to create the .env file:
cp .env.local.example .env

Next, you will generate the secret app key to be stored in .env:
node ace generate:key

From here you can run backend tests via:
node ace test

Before running the server it's best to run the migrations to set up the database:
node ace migration:run

You may also seed the database with an admin user (username: admin, password: password) and a few flashcard sets:
node ace db:seed --files "database/seeders/content_seeder.ts"

Finally, you can run the backend server!:
npm run dev

Keep note of what port the Adonis.js server is running on, as you might need it in the next step.


## Frontend

Navigate back into the project root and then into the frontend directory. Then run:
npm install

Once everything is installed, you need to create the .env file:
cp .env.local.example .env.local

Open the file and ensure that the NEXT_PUBLIC_ADONIS_API environment variable is pointed to the localhost port from the previous steps. Do not rename this variable!

From here you can run backend tests via:
npm test

Finally, you can run the frontend server!:
npm run dev

Enjoy!