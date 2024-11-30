For Mysql Database need to load the timezone to ensure the application working
```
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
```