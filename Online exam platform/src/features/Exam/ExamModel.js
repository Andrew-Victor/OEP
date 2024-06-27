const mongoose = require('mongoose')

const mcqSchema = new mongoose.Schema({
  questionTitle: {
    type: 'string',
    required: [true, 'A question must have a title'],
  },
  A: {
    type: 'string',
    lowercase: true,
  },
  B: {
    type: 'string',
    lowercase: true,
  },
  C: {
    type: 'string',
    lowercase: true,
  },
  D: {
    type: 'string',
    lowercase: true,
  },
  RightAnswer: {
    type: 'string',
    enum: ['A', 'B', 'C', 'D'],
    select: false,
  },
})

const ExamSchema = new mongoose.Schema({
  Subject: {
    type: String,
    required: [true, 'An Exam must have A Course '],
    enum: [
      'programming',
      'algorithms',
      'machine learning',
      'information systems',
    ],
  },
  mcqQuestions: {
    type: [mcqSchema],
    required: [true, 'An Exam must have A questions '],
    min: [5, 'Must be at least 5 Questions'],
  },
  startDate: {
    type: Date,
    required: [true, 'An Exam must have a start date'],
  },
  dueDate: {
    type: Date,
    required: [true, 'An Exam must have a due date'],
  },
  duration: {
    type: Number, // duration in minutes
    required: [true, 'An Exam must have a duration'],
    min: [1, 'Duration must be at least 1 minute'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Exam = mongoose.model('Exam', ExamSchema)
const MCQ = mongoose.model('Mcq', mcqSchema)
exports.Exam = Exam
exports.MCQ = MCQ
