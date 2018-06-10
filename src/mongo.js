import MongoClient from 'mongodb';

const MONGO_URL = 'mongodb://localhost:27017';

export const { ObjectID } = MongoClient;

const addTop = async (app) => {
  const exists = await app.systems.findOne({})
  if(!exists) {
    await app.systems.insert({
      level: 0,
      name: 'Pappas system',
      lowercase: 'pappas system',
      noaccent: 'pappas system',
    })
    console.log('Added toplevel system');
  }
}

/* eslint-disable no-param-reassign */
export default function (app) {
  MongoClient.connect(MONGO_URL)
    .then((connection) => {
      app.db = connection.db('pappa');
      app.systems = app.db.collection('systems');
      app.items = app.db.collection('items');
      addTop(app);
      console.log('Database connection established');
    })
    .catch(err => console.error(err));
}
