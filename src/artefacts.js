import joi from 'joi';
import { ObjectID } from './mongo';

const itemCheck = joi.object().keys({
  parent: joi.string().required(),
  name: joi.string().required(),
  lowercase: joi.string().required(),
  noaccent: joi.string().required(),
  level: joi.number().required(),
  amount: joi.object().keys({
    quantified: joi.boolean().required(),
    quantity: joi.number(),
  }).required(),
  size: joi.object().keys({
    quantified: joi.boolean().required(),
    quantity: joi.number(),
    unit: joi.string(),
  }).required(),
});

const systemCheck = joi.object().keys({
  parent: joi.string().required(),
  name: joi.string().required(),
  lowercase: joi.string().required(),
  noaccent: joi.string().required(),
  level: joi.number().required(),
});

const ids = (artefacts) => {
  const array = [];
  for (let i = 0; i < artefacts.length; i += 1) {
    array.push(artefacts[i]._id);
  }
  return array;
}

const children = async (parentID, ctx) => {
  console.log(parentID);
  const childSystems = await ctx.app.systems.find({
    parent: parentID,
  }).toArray();
  const childItems = await ctx.app.items.find({
    parent: parentID,
  }).toArray();
  return {
    items: ids(childItems),
    systems: ids(childSystems),
  };
};

const check = (query, checker) => !joi.validate(query, checker).error;

export const search = async (ctx) => {
  const { search } = ctx.request.query;
  if(typeof search !== 'string') {
    ctx.status = 403;
  } else {
    const string = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const items = await ctx.app.items.find({ $or: [
        { name: { $regex: string, $options: 'i' } },
        { noaccent: { $regex: string, $options: 'i' } },
        { lowercase: { $regex: string, $options: 'i' } },
      ] 
    }).limit(25).toArray();
    const systems = await ctx.app.systems.find({ $or: [
        { name: { $regex: string, $options: 'i' } },
        { noaccent: { $regex: string, $options: 'i' } },
        { lowercase: { $regex: string, $options: 'i' } },
      ] 
    }).limit(25).toArray();
    ctx.body = {
      items,
      systems,
    }
  }
};

export const top = async (ctx) => {
  const topSystem = await ctx.app.systems.findOne({ level: 0 });
  console.log(topSystem);
  topSystem.children = await children(topSystem._id.toHexString(), ctx)
  ctx.body = topSystem;
};

export const getSystem = async (ctx) => {
  const system = await ctx.app.systems.findOne({ _id: ObjectID(ctx.params.id) });
  system.children = await children(system._id.toHexString(), ctx);
  ctx.body = system;
};

export const addSystem = async (ctx) => {
  const system = ctx.request.body;
  system.lowercase = system.name.toLowerCase();
  system.noaccent = system.lowercase.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const parent = await ctx.app.systems.findOne({ _id: ObjectID(system.parent) });
  if(parent) {
    system.level = parent.level + 1;
    console.log(system);
    if(check(system, systemCheck)) {
      const createdSystem = await ctx.app.systems.insert( system );
      ctx.status = 201;

    } else {
      ctx.status = 403;
    }
  } else {
    ctx.status = 403;
  }
};

export const updateSystem = async (ctx) => {
  const system = await ctx.app.systems.findOne({ _id: ObjectID(ctx.params.id) });
  const changedSystem = ctx.request.body;
  if(system) {
    changedSystem.lowercase = system.name.toLowerCase();
    changedSystem.noaccent = system.lowercase.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    console.log(changedSystem);
    if(check(changedSystem, systemCheck)) {
      const updatedSystem = await ctx.app.systems.update(
        { _id: system._id },
        { $set: changedSystem },
      );
      ctx.status = 200;
    } else {
      ctx.status = 403;
    }
  } else {
    ctx.status = 403;
  }
};

export const removeSystem = async (ctx) => {
  const removedSystem = await ctx.app.system.remove({ _id: ObjectID(ctx.params.id) });
  ctx.body = removedSystem;
}

export const getItem = async (ctx) => {
  const item = await ctx.app.items.findOne({ _id: ObjectID(ctx.params.id) });
  ctx.body = item;
};

export const addItem = async (ctx) => {
  const item = ctx.request.body;
  item.lowercase = item.name.toLowerCase();
  item.noaccent = item.lowercase.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const parent = await ctx.app.systems.findOne({ _id: ObjectID(item.parent) });
  if(parent) {
    item.level = parent.level + 1;
    if(check(item, itemCheck)) {
      const createdItem = await ctx.app.items.insert( item );
      ctx.status = 201;
    } else {
      ctx.status = 403;
    }
  } else {
    ctx.status = 403;
  }
};

export const updateItem = async (ctx) => {
  const item = await ctx.app.items.findOne({ _id: ObjectID(ctx.params.id) });
  const changedItem = ctx.request.body;
  if(item) {
    changedItem.lowercase = item.name.toLowerCase();
    changedItem.noaccent = item.lowercase.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if(check(ctx.request.body, itemCheck)) {
      const updatedItem = await ctx.app.item.update(
        { _id: item._id },
        { $set: changedItem },
      );
      ctx.body = 203;
    } else {
      ctx.body = 403;
    }
  } else {
    ctx.body = 403;
  }
};

export const removeItem = async (ctx) => {
  const removedItem = await ctx.app.items.remove({ _id: ObjectID(ctx.params.id) });
  ctx.body = removedItem;
}
