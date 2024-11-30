Before run testing, need to create .env.test so the testing will run on test database and doing migrate on test database
```
NODE_ENV=test knex migrate:latest
```

For Mysql Database need to load the timezone to ensure the application working
```
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
```