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


/*
	Create a chat
*/
exports.createChat = async (req, res) => {
	console.log(`
--------------------------------------------------
  API  : Create a chat
  router.post('/createChat', MeetingContollder.createChat);
--------------------------------------------------`);
	// console.log('[[createChat]] >>>>>> ', req.body)

	const dbModels = global.DB_MODELS;

	try {
		const criteria = {
			meetingId: req.body.meetingId,
			userId: req.body.userId,
			chatMember: req.body.chatMember,
			chatContent: req.body.chatContent
		}

		const Meeting = dbModels.MeetingChat(criteria);
		console.log("[[ createChat ]] >>>>", Meeting)
		await Meeting.save();

		return res.status(200).send(
			Meeting
		)

	} catch (err) {

		return res.status(500).send({
			message: 'creatintg a meeting chat had an error'
		});

	}

}


/*
	Get a chat
*/
exports.getChat = async (req, res) => {
	console.log(`
--------------------------------------------------
  API  : Get a chat
  router.get('/getChat', MeetingContollder.getChat);
--------------------------------------------------`);
	console.log('[[getChat]] >>>>>> ', req.query.meetingId)

	const dbModels = global.DB_MODELS;

	try {
		const criteria = {
			meetingId: req.query.meetingId,
		}
	
		// 원하는 값만 query 하기 공백으로 구분
		const MeetingChat = await dbModels.MeetingChat.find(criteria).select('userId chatMember createdAt chatContent');
		console.log("[[ getChat ]] >>>>", MeetingChat)
	

		return res.status(200).send(
			MeetingChat
		)

	} catch (err) {

		return res.status(500).send({
			message: 'creatintg a meeting chat had an error'
		});

	}

}


/*
	Delete a chat
*/
exports.deleteChat = async (req, res) => {
	console.log(`
--------------------------------------------------
  API  : Get a chat
  router.delete('/deleteChat', MeetingContollder.deleteChat);
--------------------------------------------------`);
	console.log('[[deleteChat]] >>>>>> ', req.query.chatId)

	const dbModels = global.DB_MODELS;

	try {

        if (!req.query.chatId) {
            return res.status(400).send('invalid meeting id1');
        }

        const criteria = {
            _id: req.query.chatId,
        }

        // meetingId에 해당하는 모든 doc 파일들
        const deleteChat = await dbModels.MeetingChat.findOne(criteria);

		console.log(deleteChat)

        if (!deleteChat) {
            return res.status(400).send('invalid meeting id2');
        }

        
		// DB에 업로드 된 파일들도 함께 삭제
		await dbModels.MeetingChat.deleteOne(criteria);
        
		return res.status(200).send({
			message: 'deleted'
		})

    } catch (err) {
        console.log(err);
        res.status(500).send('internal server error');
    }

}