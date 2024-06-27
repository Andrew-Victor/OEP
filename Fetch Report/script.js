const reportForm = document.getElementById("reportForm");
const reportContainer = document.getElementById("reportContainer");

reportForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const studentID = document.getElementById("studentID").value;
  const examID = document.getElementById("examID").value;

  const requestData = {
    studentID: studentID,
    examID: examID,
  };

  try {
    const response = await fetch("http://127.0.0.1:4000/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data.report, null, 2));
    displayReport(data.report[0]); // Assuming you have a function to display the report
  } catch (error) {
    console.error("Error fetching report:", error);
    reportContainer.innerHTML = `<p>Error fetching report: ${error.message}</p>`;
  }
});
function convertToFullPath(inputPath) {
  const basePath =
    "C:/Users/victo/OneDrive/Desktop/Project/CV server RealTime Server";
  const standardizedInputPath = inputPath.replace(/\\/g, "/");
  const fullPath = `${basePath}/${standardizedInputPath}`;
  return fullPath;
}

function displayReport(data) {
  reportContainer.innerHTML = `
        <p><strong>Student ID:</strong> ${data.StudentID}</p>
        <p><strong>Exam ID:</strong> ${data.ExamID}</p>
        <p><strong>Subject:</strong> ${data.Subject}</p>
        <p><strong>Phone Detected:</strong> ${data.PhoneDetect}</p>
        <p><strong>More than One Face Detected:</strong> ${data.GtOneFace}</p>
        <p><strong>Looked Away:</strong> ${data.lookedAway}</p>
        <p><strong>Suspicious Images:</strong></p>
        <ul>
            ${data.SusPicsUrl.map((inputPath) => {
              let url = convertToFullPath(inputPath);
              return `<img src="${url}">`;
            }).join("")}
        </ul>
        <p><strong>Changed Tab:</strong> ${data.ChangedTab}</p>
        <p><strong>Score:</strong> ${data.Score}</p>
        <p><strong>Entered Exam At:</strong> ${data.EnteredExamAt}</p>
    `;
}
