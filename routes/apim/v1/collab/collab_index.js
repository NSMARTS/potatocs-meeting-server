const router = require('express').Router();

/*-----------------------------------
	Contollers
-----------------------------------*/
const sideNavContoller = require('./side-nav/sideNav_controller');
const spaceController = require('./space/space_controller');
const meetingController = require('./meeting/meeting_controller')

// // Folder and Space Create
// router.post('/create-folder', sideNavContoller.createFolder);
// router.post('/create-space', sideNavContoller.createSpace);
// router.get('/update-space', sideNavContoller.updateSpace);

// // in Space
// router.get('/space/:spaceTime', spaceController.getSpace);


// // meeting
// router.post('/create-meeting', meetingController.createMeeting);
// router.get('/update-meeting', meetingController.updateMeeting);
// router.post('/join-meeting', meetingController.joinMeeting)
// router.get('/get-join-meeting', meetingController.getJoinMeeting)

// realTime
router.get('/getMeetingData', meetingController.getMeetingData)

router.get('/getUserData/:userId', meetingController.getUserData)


module.exports = router;