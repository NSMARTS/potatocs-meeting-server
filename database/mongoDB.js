const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const mongApp = {}; 
mongApp.appSetObjectId = function (app) {
	app.set('ObjectId', mongoose.Types.ObjectId);
	console.log('complete to set mongoose ObjectId');
}

main().catch(err => console.log(err));

async function main() {
	await mongoose.connect(process.env.mongodb_uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}).then( ()=> {
		createSchema();
		console.log('Database Connected');
	});
}

function createSchema() {
	const dbModels = {};

	dbModels.Member = require('../models/member_schema');
	dbModels.Manager = require('../models/manager_schema');
	dbModels.LeaveRequest = require('../models/leave_request_schema');
	dbModels.UsedLeave = require('../models/used_leave_schema');
	dbModels.Folder = require('../models/folder_schema');
	dbModels.Space = require('../models/space_schema');
	dbModels.Meeting = require('../models/meeting_schema');

	// whiteBoard
	dbModels.Doc = require('../models/Doc');
	dbModels.Drawing = require('../models/Drawing');
	// dbModels.whiteBoardMeeting = require('../models/Meeting');

	global.DB_MODELS = dbModels;
}

module.exports = mongApp;
