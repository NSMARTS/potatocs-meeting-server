const mongoose = require('mongoose');

const meetingScehma = mongoose.Schema(
	{
        _id: mongoose.Schema.Types.ObjectId,
        
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
        },
        enlistedMembers: [ // 스페이스에 있는 멤버들
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Member',
            }
        ],
        currentMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Member',
            }
        ],
        docId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
        },
        meetingTitle: {
            type: String
        },
        isDone: {
            type: Boolean
        },
        start_date: {
            type: Date
        },
        start_time: {
            type: String
        }
    

	},
	{
		timestamps: true
	}
);

const Meeting = mongoose.model('Meeting', meetingScehma);

module.exports = Meeting;


// const mongoose = require('mongoose');

// const meetingSchema = mongoose.Schema(
// 	{
// 		manager: { 
//             type: mongoose.Schema.Types.ObjectId, 
//             ref: 'Member',
//         },
//         enlistedMembers: [
//             {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'Member',
//             }
//         ],
//         meetingTitle : {
//             type: String,
//             required: true
//         },
//         docId : {
//             type: String,
//             // ref:, 'Member',
//         },
//         spaceTime : {
//             type: String,
//         }
// 	},
// 	{
// 		timestamps: true
// 	}
// );


// const Meeting = mongoose.model('Meeting', meetingSchema);

// module.exports = Meeting;


