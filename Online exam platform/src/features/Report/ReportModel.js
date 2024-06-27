const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
  StudentID: {
    type: 'string',
    required: [true, 'Report must have a Student ID'],
  },
  ExamID: {
    type: 'string',
    required: [true, 'Report must have a Exam ID'],
  },
  Subject: {
    type: 'string',
    required: [true, 'Report must have a Subject ID'],
  },
  PhoneDetect: {
    type: 'Boolean',
  },
  SusPicsUrl: {
    type: [String],
  },
  GtOneFace: {
    type: 'Boolean',
  },
  lookedAway: {
    type: 'Boolean',
  },
  ChangedTab: {
    type: 'Boolean',
    required: [true, 'Report must Know if Student have changed the Exam tab'],
  },
  Score: {
    type: 'Number',
    required: [true, 'Report must Know Student Score'],
  },
  EnteredExamAt: {
    type: String,
    required: [true, 'Report must Know When student have entered the exam'],
  },
})

const Report = mongoose.model('Report', ReportSchema)
module.exports = Report
