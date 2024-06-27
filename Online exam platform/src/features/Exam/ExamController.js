const Exam = require('./ExamModel').Exam
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const ReportController = require('../Report/ReportController')
exports.getExam = catchAsync(async (req, res, next) => {
  try {
    const exam = await Exam.find()
    res.status(200).json({ success: true, data: exam })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

exports.getExamBySubject = catchAsync(async (req, res, next) => {
  const subject = req.body.subject
  const exam = await Exam.find({ subject: subject })
  if (!exam) {
    return next(new AppError('no Exams found for this Subject!', 400))
  }

  res.status(200).json({ success: true, data: exam })
})

exports.addExam = catchAsync(async (req, res, next) => {
  const newExam = await Exam.create(req.body)
  res.status(200).send({
    status: 'success',
    data: newExam,
  })
})

exports.submitAnswer = catchAsync(async (req, res, next) => {
  console.log('hit submitAnswer ')
  console.log(`req is ${req}`)
  const submitedAnswers = req.body.submitedQuestions
  const examid = req.body.examid
  const exam = await Exam.findById({ _id: examid })
    .select('+mcqQuestions.RightAnswer')
    .exec()
  let rightQuestion = []
  const DBanswers = exam.mcqQuestions
  submitedAnswers.forEach((submitedAnswer) => {
    let question = DBanswers.find(
      (item) => item._id.toString() === submitedAnswer.id
    )
    console.log(question.RightAnswer)
    if (question) {
      if (
        question.RightAnswer.toLowerCase() ===
        submitedAnswer.answer.toLowerCase()
      ) {
        rightQuestion.push(question)
      }
    }
  })
  res.status(200).send({
    status: 'success',
    score: rightQuestion.length,
    data: { rightQuestion },
  })
  ReportController.triggerAnalyze();
})

// exports.tempAddExam = async (req, res, next) => {
//   let json = [
//     {
//       Subject: 'programming',
//       mcqQuestions: [
//         {
//           questionTitle: 'What is the output of console.log(typeof [])?',
//           A: 'object',
//           B: 'array',
//           C: 'null',
//           D: 'undefined',
//           RightAnswer: 'A',
//         },
//         {
//           questionTitle:
//             'Which keyword is used to define a variable in JavaScript?',
//           A: 'var',
//           B: 'let',
//           C: 'const',
//           D: 'all of the above',
//           RightAnswer: 'D',
//         },
//         {
//           questionTitle:
//             'Which method is used to add an element at the end of an array in JavaScript?',
//           A: 'push',
//           B: 'pop',
//           C: 'shift',
//           D: 'unshift',
//           RightAnswer: 'A',
//         },
//         {
//           questionTitle: 'Which company developed JavaScript?',
//           A: 'Microsoft',
//           B: 'Apple',
//           C: 'Netscape',
//           D: 'Google',
//           RightAnswer: 'C',
//         },
//         {
//           questionTitle: 'Which of the following is a JavaScript framework?',
//           A: 'React',
//           B: 'Laravel',
//           C: 'Django',
//           D: 'Spring',
//           RightAnswer: 'A',
//         },
//         {
//           questionTitle:
//             'What is the main purpose of a constructor function in JavaScript?',
//           A: 'To construct an HTML element',
//           B: "To define an object's blueprint",
//           C: 'To call a function',
//           D: 'To destroy an object',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle:
//             'Which of the following is not a JavaScript data type?',
//           A: 'Number',
//           B: 'String',
//           C: 'Boolean',
//           D: 'Character',
//           RightAnswer: 'D',
//         },
//         {
//           questionTitle:
//             'Which function is used to serialize an object into a JSON string in JavaScript?',
//           A: 'JSON.parse()',
//           B: 'JSON.stringify()',
//           C: 'JSON.objectify()',
//           D: 'JSON.serialize()',
//           RightAnswer: 'B',
//         },
//       ],
//       startDate: '2023-07-01T10:00:00Z',
//       dueDate: '2023-07-01T12:00:00Z',
//       duration: 120,
//       createdAt: '2023-06-01T09:00:00Z',
//     },
//     {
//       Subject: 'machine learning',
//       mcqQuestions: [
//         {
//           questionTitle:
//             'Which of the following is a supervised learning algorithm?',
//           A: 'K-means clustering',
//           B: 'Linear regression',
//           C: 'Apriori',
//           D: 'Autoencoders',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle:
//             'Which of the following is used to prevent overfitting in a model?',
//           A: 'Dropout',
//           B: 'Batch normalization',
//           C: 'Early stopping',
//           D: 'All of the above',
//           RightAnswer: 'D',
//         },
//         {
//           questionTitle: 'Which library is used for deep learning in Python?',
//           A: 'Pandas',
//           B: 'NumPy',
//           C: 'TensorFlow',
//           D: 'Matplotlib',
//           RightAnswer: 'C',
//         },
//         {
//           questionTitle: "What does 'SVM' stand for in machine learning?",
//           A: 'Support Vector Machine',
//           B: 'Simple Vector Machine',
//           C: 'Supervised Vector Machine',
//           D: 'None of the above',
//           RightAnswer: 'A',
//         },
//         {
//           questionTitle:
//             'Which technique is used for dimensionality reduction?',
//           A: 'PCA',
//           B: 'LDA',
//           C: 't-SNE',
//           D: 'All of the above',
//           RightAnswer: 'D',
//         },
//         {
//           questionTitle: 'What is the main goal of unsupervised learning?',
//           A: 'To predict labels',
//           B: 'To find hidden patterns',
//           C: 'To reduce noise',
//           D: 'To test hypotheses',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle: 'Which algorithm is used for anomaly detection?',
//           A: 'Naive Bayes',
//           B: 'Isolation Forest',
//           C: 'Linear Regression',
//           D: 'KNN',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle:
//             'Which evaluation metric is used for classification problems?',
//           A: 'MSE',
//           B: 'RMSE',
//           C: 'Confusion Matrix',
//           D: 'R-Squared',
//           RightAnswer: 'C',
//         },
//       ],
//       startDate: '2023-08-01T14:00:00Z',
//       dueDate: '2023-08-01T16:00:00Z',
//       duration: 120,
//       createdAt: '2023-07-01T13:00:00Z',
//     },
//     {
//       Subject: 'information systems',
//       mcqQuestions: [
//         {
//           questionTitle:
//             'Which of the following is a type of information system?',
//           A: 'Transaction Processing System',
//           B: 'Management Information System',
//           C: 'Decision Support System',
//           D: 'All of the above',
//           RightAnswer: 'D',
//         },
//         {
//           questionTitle: 'What does ERP stand for?',
//           A: 'Enterprise Resource Planning',
//           B: 'Enterprise Resource Process',
//           C: 'Enterprise Reporting Process',
//           D: 'Enterprise Resource Performance',
//           RightAnswer: 'A',
//         },
//         {
//           questionTitle:
//             'Which database model is considered the most flexible?',
//           A: 'Hierarchical',
//           B: 'Network',
//           C: 'Relational',
//           D: 'Object-oriented',
//           RightAnswer: 'C',
//         },
//         {
//           questionTitle: 'What is the main purpose of a CRM system?',
//           A: 'To manage customer relationships',
//           B: 'To manage financial transactions',
//           C: 'To manage supply chains',
//           D: 'To manage employee performance',
//           RightAnswer: 'A',
//         },
//         {
//           questionTitle:
//             'Which of the following is a common use of data warehouses?',
//           A: 'Transactional Processing',
//           B: 'Data Mining',
//           C: 'Real-time Analytics',
//           D: 'Daily Operations',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle:
//             'Which of the following is an example of unstructured data?',
//           A: 'A database table',
//           B: 'A text document',
//           C: 'A CSV file',
//           D: 'An Excel spreadsheet',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle:
//             'Which technology is commonly used for big data processing?',
//           A: 'SQL',
//           B: 'Hadoop',
//           C: 'XML',
//           D: 'HTML',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle:
//             'What is the primary goal of Business Intelligence (BI)?',
//           A: 'To store data',
//           B: 'To analyze data',
//           C: 'To create data',
//           D: 'To delete data',
//           RightAnswer: 'B',
//         },
//       ],
//       startDate: '2023-09-01T09:00:00Z',
//       dueDate: '2023-09-01T11:00:00Z',
//       duration: 120,
//       createdAt: '2023-08-01T08:00:00Z',
//     },
//     {
//       Subject: 'algorithms',
//       mcqQuestions: [
//         {
//           questionTitle:
//             'Which of the following sorting algorithms has the best average case time complexity?',
//           A: 'Bubble Sort',
//           B: 'Merge Sort',
//           C: 'Selection Sort',
//           D: 'Insertion Sort',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle: 'What is the time complexity of binary search?',
//           A: 'O(n)',
//           B: 'O(log n)',
//           C: 'O(n^2)',
//           D: 'O(1)',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle: 'Which data structure is used to implement recursion?',
//           A: 'Queue',
//           B: 'Stack',
//           C: 'Heap',
//           D: 'Tree',
//           RightAnswer: 'B',
//         },
//         {
//           questionTitle:
//             'Which of the following algorithms is used to find the shortest path in a graph?',
//           A: 'DFS',
//           B: 'BFS',
//           C: "Dijkstra's Algorithm",
//           D: "Kruskal's Algorithm",
//           RightAnswer: 'C',
//         },
//         {
//           questionTitle:
//             'What is the space complexity of the depth-first search (DFS) algorithm?',
//           A: 'O(V)',
//           B: 'O(E)',
//           C: 'O(V+E)',
//           D: 'O(V^2)',
//           RightAnswer: 'A',
//         },
//         {
//           questionTitle:
//             'Which of the following is not a characteristic of a greedy algorithm?',
//           A: 'Local optimal choice',
//           B: 'Iterative approach',
//           C: 'Backtracking',
//           D: 'Feasibility check',
//           RightAnswer: 'C',
//         },
//         {
//           questionTitle:
//             'Which algorithm is used to check if a graph is bipartite?',
//           A: "Kruskal's Algorithm",
//           B: "Prim's Algorithm",
//           C: 'DFS',
//           D: 'BFS',
//           RightAnswer: 'D',
//         },
//         {
//           questionTitle: "What does 'P' stand for in 'P vs NP' problem?",
//           A: 'Polynomial Time',
//           B: 'Prime Time',
//           C: 'Preprocessing Time',
//           D: 'Partial Time',
//           RightAnswer: 'A',
//         },
//       ],
//       startDate: '2023-10-01T13:00:00Z',
//       dueDate: '2023-10-01T15:00:00Z',
//       duration: 120,
//       createdAt: '2023-09-01T12:00:00Z',
//     },
//   ]
//   let x = await Exam.insertMany(json)
//   console.log('Mock data inserted')
//   res.status(200).send({ x })
// }
