const router = require('express').Router();

/*-----------------------------------
	Contollers
-----------------------------------*/

const meetingController = require('./meeting/meeting_controller')


// // meeting
// router.post('/create-meeting', meetingController.createMeeting);
// router.get('/update-meeting', meetingController.updateMeeting);
// router.post('/join-meeting', meetingController.joinMeeting)
// router.get('/get-join-meeting', meetingController.getJoinMeeting)

// realTime
router.get('/getMeetingData', meetingController.getMeetingData)
router.get('/getUserData/:userId', meetingController.getUserData)
router.post('/createChat', meetingController.createChat)
router.get('/getChat', meetingController.getChat)


module.exports = router;