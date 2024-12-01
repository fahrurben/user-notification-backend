# User Notifications Backend

### Stack
* NodeJS v22.11.0
* Mysql 8.0.40


#### Step 1: Database Setup
- Create 2 database on mysql for development and testing
- Mysql Database need to load the timezone to ensure the application working
```
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
```

#### Step 2: Initial Setup
- Clone the repository: `git clone https://github.com/fahrurben/user-notification-backend.git`
- Navigate: `cd user_notification_backend`
- Install dependencies: `npm ci`

#### Step 3: Environment Configuration
- Create `.env`: Copy `.env.template` to `.env`
- Create `.env`: Copy `.env.template` to `.env.test`
- Update `.env` and `.env.test`: Fill in necessary environment variables

#### Step 4: Running the Project
- Running migrations: `knex migrate:latest`
- Development Mode: `npm run dev`
- The Notification send via schedule/cron job

#### Step 5: Testing the Project
- Running migrations: `NODE_ENV=test knex migrate:latest`
- **Run Dev Server, need to run server when testing send email**: `npm run dev`
- Run Test: `npm run test`
- **Notes: Sometimes test failed caused of timeout and error on purpose**

#### API Docs
The API docs also can check on file `docs/User Birthday.postman_collection.json`

##### Create User
POST `http://localhost:8000/api/users`
```json
{
    "email": "test@test.com",
    "firstName": "John",
    "lastName": "Doe",
    "birthday": "2024-11-30",
    "location": "Asia/Jakarta"
}
```

##### Delete User
DELETE `http://localhost:8000/api/users/:id`

##### Send Email
POST `http://localhost:8000/send-email`
```json
{
  "email": "test@test.com",
  "message": "Hey, John Doe it’s your birthday"
}
```