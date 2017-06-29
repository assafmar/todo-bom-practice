// Minimal Simple REST API Handler (in memory)
// Author: Yaron Biton misterBIT.co.il

"use strict";
const express = require('express'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	upload = require('./uploads');
const serverRoot = 'http://localhost:3003/';
// Main Cache object, entities are lazily loaded and saved here for in memory CRUD
const cache = {};


function getObjList(objType) {
	if (!/^[a-zA-Z0-9]+$/g.test(objType)) {
		cl('Invalid Entitiy name');
		return [];
	}
	if (!cache[objType]) {
		try {
			cache[objType] = require('./data/' + objType + '/list.json');
		} catch (e) {
			//case initial file is undefined
			cache[objType] = [];
		}
	}
	return cache[objType];
}


var corsOptions = {
	origin: /http:\/\/localhost:\d+/,
	credentials: true
};


const app = express();
app.use(express.static('uploads'));
app.use(cors(corsOptions));
app.use(bodyParser.json());

// GETs a list
app.get('/data/:objType', function (req, res) {
	const objs = getObjList(req.params.objType);
	cl("Returning list of " + objs.length + " " + req.params.objType + "s");
	res.json(objs);
});

// GETs a single
app.get('/data/:objType/:id', function (req, res) {
	cl("GET for single " + req.params.objType);
	const objs = getObjList(req.params.objType);
	const obj = objs.find(obj => obj._id == req.params.id);
	res.json(obj);
});
// move a single
app.get('/data/move/:objType/:id/:diff', function (req, res) {//http://localhost:3003/data/move/todo
	cl("GET for single " + req.params.objType);
	const objs = getObjList(req.params.objType);
	const obj = objs.find(obj => obj._id == req.params.id);
	
	const idx = findIndexForId(objs, req.params.id)
	console.lof('obj:',obj)
	console.lof('id:',id)
	
	//if((idx + req.params.diff) >0 && (idx + req.params.diff) <objs.length )
	res.json(obj);
});

// DELETE
app.delete('/data/delete/:objType/:id', function (req, res) {
	cl("DELETE for single1 " + req.params.objType);
	cl("DELETE req.params._id*** "  + req.params.id);
	const objs = getObjList(req.params.objType);
	let idx = findIndexForId(objs, req.params.id);
	
	var isSuccess = false;
	if (idx !== -1) {
		cl('objs.len:',objs.length);
		objs.splice(idx, 1);
		isSuccess = true;
		cl('objs.len:',objs.length);
	}
	res.json({isSuccess});
});

// POST - adds 

app.post('/data/:objType', upload.single('file'), function (req, res) {
	cl("POST for " + req.params.objType);
	const objs = getObjList(req.params.objType);
	let obj = req.body;
	if (req.file) {
		obj.imgUrl = serverRoot + req.file.filename;
	}
	obj._id = findNextId(objs);
	objs.push(obj);
	res.json(obj);
});

// PUT - updates
app.put('/data/:objType/:id', function (req, res) {
	cl("PUT for " + req.params.objType);
	const objs = getObjList(req.params.objType);
	const newObj = req.body;
	let success = false;
	let idx = findIndexForId(objs, req.params.id);
	if (idx !== -1) {
		objs[idx] = newObj;
		success = true;
	}
	if (success) res.json(newObj);
	else res.json(404, { error: 'not found' })
});


// Kickup our server 
const baseUrl = 'http://localhost:3003/data';
app.listen(3003, function () {
	console.log(`misterREST server is ready at ${baseUrl}`);
	console.log(`GET (list): \t\t ${baseUrl}/{entity}`);
	console.log(`GET (single): \t\t ${baseUrl}/{entity}/{id}`);
	console.log(`DELETE: \t\t ${baseUrl}/{entity}/{id}`);
	console.log(`PUT (update): \t\t ${baseUrl}/{entity}/{id}`);
	console.log(`POST (add): \t\t ${baseUrl}/{entity} - INDEX IS automatically ADDED AT _id`);

});


// Some small time utility functions
function cl(...params) {
	console.log.apply(console, params);
}

function findIndexForId(objs, id) {
	for (var i = 0; i < objs.length; i++) {
		if (objs[i]._id == id ) return i;
	}
	return -1;
}

// function findNextId(objs) {
// 	var nextId = 0;
// 	for (var i = 0; i < objs.length; i++) {
// 		if (objs[i]._id > nextId) nextId = objs[i]._id;
// 	}
// 	return nextId + 1;
// }

function findNextId()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}