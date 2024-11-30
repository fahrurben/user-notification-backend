import dotenv, {config} from 'dotenv'
import moment from "moment-timezone";
import * as process from "process";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}


const knexfile = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: '+07:00',
    typeCast: function (field, next) {
      if (field.type == 'DATE') {
        return moment(field.string()).format('YYYY-MM-DD');
      } else if (field.type == 'DATETIME') {
        return moment(field.string()).format('YYYY-MM-DD HH:mm:ss');
      }
      return next();
    },
  },
  migrations: {
    directory: "src/db/migrations",
  },
}

export default knexfile;