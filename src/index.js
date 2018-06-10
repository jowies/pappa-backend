import Koa from 'koa';
import Router from 'koa-router';
import cors from 'kcors';
import parser from 'koa-bodyparser';
import logger from 'koa-logger';

import Mongo from './mongo';

import * as artefacts from './artefacts';

const app = new Koa();
const router = new Router();

Mongo(app);


app.use(cors());
app.use(parser());
app.use(logger());

router.get('/', artefacts.search);

router.get('/systems/top', artefacts.top);

router.get('/systems/:id', artefacts.getSystem);

router.post('/systems/', artefacts.addSystem);

router.put('/systems/:id', artefacts.updateSystem);

router.delete('/systems/:id', artefacts.removeSystem);


router.get('/items/:id', artefacts.getItem);

router.post('/items/', artefacts.addItem);

router.put('/items/:id', artefacts.updateItem);

router.delete('/items/:id', artefacts.removeItem);




app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
console.log('Application running on port 3000');