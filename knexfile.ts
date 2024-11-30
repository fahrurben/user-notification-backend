const knexfile = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: 'users_db.sqlite',
  },
  migrations: {
    directory: "src/db/migrations",
  },
}

export default knexfile;