const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const s3 = global.AWS_S3.s3;
const bucket = global.AWS_S3.bucket;
/**
 *    Meeting 정보 받아오기
 *  - TEST용도로 meeting이 없는 경우 meeting 생성
 *  - meeting 생성 시 whiteboard document 미리 생성
 */
exports.meetingInfo = async (req, res) => {

    console.log(`
--------------------------------------------------
  User : 
  API  : Get my Meeting
  router.get(/meetingInfo:meetingId', whiteBoardContollder.meetingInfo);
--------------------------------------------------`);
    const dbModels = global.DB_MODELS;
    console.log(dbModels)

    // const criteria = {
    //     _id: new mongoose.Types.ObjectId(),
    //     meetingName: 'testRoom',
    //     meetingCreator: '이정운', // 회의 생성자
    //     member: ['haha', 'hoho', 'hihi'], // 회의 참가자
    //     banMember: ['koko', 'momo'], // 벤 당한 참가자
    // }
    console.log(req.params.meetingId)
    // 미팅 아이디
    const criteria = {
        _id: req.params.meetingId
    }

    // 스페이스에서 받은 미팅정보와 DB에 저장되어있는 미팅정보 비교
    try {

        let meetingInfo = await dbModels.Meeting.findOne(criteria).populate('enlistedMembers')

        console.log('[[meetingInfo]]', meetingInfo)



        // 유효성 검사
        if (meetingInfo) {
            //임시 미팅 생성 시작
            // const meetingData = new dbModels.Meeting(criteria);
            // console.log(meetingData);
            // meetingInfo = await meetingData.save()

            // Whiteboard document 생성
            const docObj = {
                _id: new mongoose.Types.ObjectId(),
                meetingId: meetingInfo._id,
                originalFileName: 'whiteboard',
                fileName: 'whiteboard',
                uploadUser: 'admin',
                saveKey: 'pdf/whiteboard.pdf',
                fileSize: 1840,
            }

            dbModels.Doc.init();
            let DocInfo = await dbModels.Doc.findOne({ meetingId: docObj.meetingId });
            // Doc이 없는 경우
            if (!DocInfo) {
                const docData = new dbModels.Doc(docObj);
                await docData.save();
            }

        } else {
            res.status(500).send('internal server error');
        }

        res.send(meetingInfo)


    } catch (error) {
        console.log(error);
        res.status(500).send('internal server error');
    }

}



/**
 *   참가한 회의 정보 불러오기
 */
exports.documentInfo = async (req, res) => {

    console.log(`
--------------------------------------------------
  User : 
  API  : Get my documentInfo
  router.get(/documentInfo/:meetingId', whiteBoardContollder.documentInfo);
--------------------------------------------------`);
    const dbModels = global.DB_MODELS;
    console.log(dbModels)

    const criteria = {
        meetingId: req.params.meetingId
    }


    // console.log('req.params.meetingId-------------------------------');
    // console.log(req.params.meetingId)
    try {
        const meetingResult = await dbModels.Meeting.findOne(criteria);


        const docResult = await dbModels.Doc.find(criteria).select({ saveKey: 0, meetingId: 0 });
        res.send({ meetingResult: meetingResult, docResult: docResult })

        console.log('criteria', criteria)
        console.log('docResult', docResult)
    } catch (error) {
        console.log(error);
    }


}

/**
 *   1개의 document(pdf) 불러오기
 *   _id: document의 id
 */
exports.document = async (req, res) => {

    console.log(`
--------------------------------------------------
  User : 
  API  : Get my document
  router.get(/document/:_id', whiteBoardContollder.document);
--------------------------------------------------`);
    const dbModels = global.DB_MODELS;
    console.log(dbModels)

    const criteria = {
        _id: req.params._id
    }

    dbModels.Doc.findOne(criteria).then((result) => {
        const key = result.saveKey;
        console.log(key)
        res.attachment(key);
        var file = s3.getObject({
          Bucket: bucket,
          Key: key
          }).createReadStream()
            .on("error", error => {
            });
        file.pipe(res);
    })

    // dbModels.Doc.findOne(criteria).then((result) => {
    //     const filePath = `./` + result.savePath;
    //     console.log(filePath);
    //     res.download(filePath);
    // })

}


exports.upload = async (req, res) => {

    console.log(`
--------------------------------------------------
  User : ${req.params.meetingId}
  API  : Post my pdf
  router.post(/upload/:meetingId', meetingContollder.upload);
--------------------------------------------------`);
    const dbModels = global.DB_MODELS;

    try {

        if (!req.params.meetingId) {
            return res.status(400).send('invalid meeting id1');
        }

        result = await dbModels.Meeting.findOne({ _id: req.params.meetingId });

        if (!result) {
            return res.status(400).send('invalid meeting id2');
        }
        // console.log(req.files[0])
        const criteria = {
            _id: new mongoose.Types.ObjectId(),
            meetingId: result._id,
            originalFileName: req.files[0].originalname,
            fileName: req.files[0].filename,
            uploadUser: 'haha', // !!! user _id 로 변경? (비회원인 경우는?)
            // savePath: req.files[0].path,
            saveKey: req.files[0].key,
            fileSize: req.files[0].size,
        }
        console.log('[ key ]', req.files[0].key);

        // console.log(docObj)
        dbModels.Doc.init();
        const docData = new dbModels.Doc(criteria);
        await docData.save()
        res.send({ message: 'document uploaded' });

    } catch (err) {
        console.log(err);
        res.status(500).send('internal server error');
    }

}



/*********************************
*   미팅이 삭제되면 관련된 pdf파일들 전부 삭제
*   _id: meeting의 id
********************************/
exports.deleteMeetingPdfFile = async (req, res) => {

    console.log(`
--------------------------------------------------
  User : ${req.query}
  API  : Post my pdf
  router.post(/deleteMeetingPdfFile', meetingContollder.deleteMeetingPdfFile);
--------------------------------------------------`);
    const dbModels = global.DB_MODELS;

    console.log('[ meetingId ]', req.query._id)

    try {

        if (!req.query._id) {
            return res.status(400).send('invalid meeting id1');
        }

        const criteria = {
            meetingId: req.query._id,
        }

        // meetingId에 해당하는 모든 doc 파일들
        const deletePdfFile = await dbModels.Doc.find(criteria);

        if (!deletePdfFile) {
            return res.status(400).send('invalid meeting id2');
        }

        // 파일의 고유한 saveKey로 반복 삭제
        for (let index = 0; index < deletePdfFile.length; index++) {
            const element = deletePdfFile[index].saveKey;
            const params = {
                // Bucket: "potatocs-meeting-pdf",
                Bucket: "test-potatocs",
                Key: element
            }

            // 그림을 그리는 화이트보드는 제외(s3에서 불러오는 화이트보드 파일)
            if (element !== 'pdf/whiteboard.pdf') {
                await s3.deleteObject(params, function (err, data) {
                    if (err) console.log(err, err.stack);  // error
                    else console.log('delete doc files');  // deleted
                });
            }

            // DB에 업로드 된 파일들도 함께 삭제
            await dbModels.Doc.deleteOne(criteria);
        }

    } catch (err) {
        console.log(err);
        res.status(500).send('internal server error');
    }

}
