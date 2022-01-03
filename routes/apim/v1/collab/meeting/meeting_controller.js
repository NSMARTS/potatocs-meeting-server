const { ObjectId } = require('bson');

/* 
	Get Meeting Data
*/
exports.getMeetingData = async (req, res) => {

	console.log(`
--------------------------------------------------
  User : 
  API  : Get my Meeting
  router.get(/getMeetingData', meetingContollder.getMeetingData);
--------------------------------------------------`);
	const dbModels = global.DB_MODELS;

	const meetingId = req.query.meetingId;
	console.log('[[ meetingId ]]', meetingId)

	const criteria = {
		_id: req.query.meetingId,
	}


	try {
		const meetingData = await dbModels.Meeting.findOne(criteria).populate('enlistedMembers')
		console.log('[[ getMeetingData ]]', meetingData)
		console.log('-------------------------------------------')

		return res.send({
			success: true,
			meetingData,
		});
	} catch (err) {
		console.log('[ ERROR ]', err);
		res.status(500).send('getMeetingData Error')
	}

}


/* 
	Get User Data
*/
exports.getUserData = async (req, res) => {

	console.log(`
--------------------------------------------------
  User : 
  API  : Get my UserData
  router.get(/getUserData', meetingContollder.getUserData);
--------------------------------------------------`);
	const dbModels = global.DB_MODELS;

	const userId = req.params.userId;
	console.log('[[ userId ]]', userId)

	const criteria = {
		_id: req.params.userId,
	}


	try {
		const userData = await dbModels.Member.findOne(criteria);
		console.log('[[ getuserData ]]', userData)
		console.log('-------------------------------------------')

		return res.send({
			userData: userData
		});
	} catch (err) {
		console.log('[ ERROR ]', err);
		res.status(500).send('getuserData Error')
	}

}
// /*
// 	Create a meeting
// */
// exports.createMeeting = async (req, res) => {
// 	console.log(`
// --------------------------------------------------
//   User : ${req.decoded._id}
//   API  : Create a folder
//   router.post('/create-meeting', MeetingContollder.createMeeting);

//   meetingTitle : ${req.body.meetingTitle}
//   meetingBrief : ${req.body.meetingBrief}
// --------------------------------------------------`);
// 	console.log('[[createMeeting]] >>>>>> ', req.body)

// 	const dbModels = global.DB_MODELS;

// 	try {
// 		const criteria = {
// 			members: [],
// 			manager: req.decoded._id,
// 			enlistedMembers: [],
// 			meetingTitle: req.body.meetingTitle,
// 			docId: req.body.docId,
// 			spaceTime : req.body.spaceTime
// 		}

// 		const Meeting = dbModels.Meeting(criteria);
// 		console.log("[[ Meeting ]] >>>>", Meeting)
// 		await Meeting.save();

// 		return res.status(200).send({
// 			message: 'created',
// 		})

// 	} catch (err) {

// 		return res.status(500).send({
// 			message: 'creatintg a meeting had an error'
// 		});

// 	}

// }

// exports.updateMeeting = async (req, res) => {

// 	console.log(`
// --------------------------------------------------
//   User : ${req.decoded._id}
//   API  : Get my Meeting
//   router.get(/update-meeting', meetingContollder.updateMeeting);
// --------------------------------------------------`);
// 	const dbModels = global.DB_MODELS;
// 	console.log(req.query)

// 	try {	

// 		const criteria = {
// 			docId: req.query.docId,
// 			spaceTime : req.query.spaceTime
// 		}

// 		const meetingData = await dbModels.Meeting.find(criteria);

// 		console.log('meetingData >>> ', meetingData)

// 		return res.status(200).send({
// 			message: 'updated',
// 			meetingData,

// 		})


// 	} catch (err) {

// 		console.log('[ ERROR ]', err);
// 		res.status(500).send({
// 			message: 'loadUpateMenu Error'
// 		})
// 	}

// }

// // 회의 참가
// exports.joinMeeting = async (req, res) => {

// 	console.log(`
// --------------------------------------------------
//   User : ${req.decoded._id}
//   API  : Get my Meeting
//   router.post(/join-meeting', meetingContollder.joinMeeting);
// --------------------------------------------------`);
// 	const dbModels = global.DB_MODELS;

// 	try {	
// 		// Find the document that describes "_id"
// 		const criteria = {
// 			_id: req.body._id, // 회의 id
// 		}

// 		// Set some fields in that document
// 		const update = {
// 			members: req.decoded._id
// 		}

// 		// Return the updated document instead of the original document
// 		const options = { returnNewDocument: true };

// 		const meetingData = await dbModels.Meeting.findOneAndUpdate(criteria, {$addToSet: update}, options)
// 		.then(updatedDocument => {
// 			if(updatedDocument) {
// 			  console.log(`[[ Successfully updated document ]]: ${updatedDocument}.`)
// 			} else {
// 			  console.log("No document matches the provided query.")
// 			}
// 			return updatedDocument
// 		  })
// 		  .catch(err => console.error(`Failed to find and update document: ${err}`))

// 		//   console.log(meetingData)

// 		return res.status(200).send({
// 			message: 'join',
// 			meetingData,
// 		})


// 	} catch (err) {

// 		console.log('[ ERROR ]', err);
// 		res.status(500).send({
// 			message: 'joinMeeting Error'
// 		})
// 	}

// }


// exports.getJoinMeeting = async (req, res) => {

// 	console.log(`
// --------------------------------------------------
//   User : ${req.decoded._id}
//   API  : Get my Meeting
//   router.get(/get-join-meeting', meetingContollder.getJoinMeeting);
// --------------------------------------------------`);
// 	const dbModels = global.DB_MODELS;

// 	console.log(req.query)

// 	try {	

// 		const criteria = {
// 			members: req.decoded._id,
// 			_id: req.query._id
// 		}

// 		const meetingData = await dbModels.Meeting.find(criteria);
// 		console.log('[[ getJoinMeeting ]]', meetingData)

// 		return res.status(200).send({
// 			message: 'getJoinMeeting',
// 			meetingData,

// 		})


// 	} catch (err) {

// 		console.log('[ ERROR ]', err);
// 		res.status(500).send({
// 			message: 'getJoinMeeting Error'
// 		})
// 	}

// }