const Report = require('../Report/ReportModel')
const Student = require('../Student/StudentModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getReportById = catchAsync(async (req, res, next) => {
  const { studentID, examID } = req.body
  console.log(studentID, examID)
  if (!studentID || !examID)
    return next(new AppError('studentID or examID not found', 400))
  const report = await Report.find({
    StudentID: studentID,
    ExamID: examID,
  }).exec()
  console.log(report)
  res.status(200).json({
    status: 'success',
    report: report,
  })
})

exports.triggerAnalyze = catchAsync(
  async (Score, ChangedTab, EnteredExamAt) => {
    //TODO : refactor later to take exam id and student ID as a parameter
    console.log('analyze hit')
    const response = await fetch('http://127.0.0.1:8000/trigger/12344/2222')
    console.log(`response is  ${response}`)
    const data = await response.json()
    console.log(`data is  ${JSON.stringify(data, null, 2)}`)
    const PhoneDetect = data.phone_detected.length > 0 ? true : false
    const GtOneFace = data.face_count.length > 0 ? true : false
    const lookedAway = data.direction.length > 0 ? true : false
    const SusPicsUrl = data.all_images
    const report = new Report({
      StudentID: '2222',
      ExamID: '12344',
      Subject: 'Programming',
      PhoneDetect,
      GtOneFace,
      lookedAway,
      SusPicsUrl,
      ChangedTab: true,
      Score: 7,
      EnteredExamAt: '21:00',
    })
    const savedReport = await report.save()
    console.log(`savedReport : ${savedReport}`)
  }
)
