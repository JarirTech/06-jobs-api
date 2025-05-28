import {
  inputEnabled,
  setDiv,
  message,
  setToken,
  token,
  enableInput,
} from "./index.js";
import { showLoginRegister } from "./loginRegister.js";
import { showAddEdit } from "./addEdit.js";

let jobsDiv = null;
let jobsTable = null;
let jobsTableHeader = null;
let jobsMessage = null;

export const handleJobs = () => {
  jobsDiv = document.getElementById("jobs");
  jobsMessage = document.getElementById("jobs-message");
  const logoff = document.getElementById("logoff");
  const addJob = document.getElementById("add-job");
  jobsTable = document.getElementById("jobs-table");
  jobsTableHeader = document.getElementById("jobs-table-header");

  jobsDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addJob) {
        showAddEdit(null);
      } else if (e.target === logoff) {
        setToken(null);
        message.textContent = "You have been logged off.";
        jobsTable.replaceChildren(jobsTableHeader);
        showLoginRegister();
      } else if (e.target.classList.contains("editButton")) {
        message.textContent = "";
        showAddEdit(e.target.dataset.id);
      } else if (e.target.classList.contains("deleteButton")) {
        const jobId = e.target.dataset.id;
        deleteJob(jobId);
      }
    }
  });
};

const deleteJob = async (jobId) => {
  if (confirm("Are you sure you want to delete this job?")) {
    enableInput(false);
    
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        message.textContent = "Job successfully deleted";
        showJobs(); // Refresh the job list
      } else {
        const data = await response.json();
        message.textContent = data.msg || "Failed to delete job";
      }
    } catch (err) {
      console.error(err);
      message.textContent = "A communications error occurred.";
    }
    
    enableInput(true);
  }
};

export const showJobs = async () => {
  try {
    enableInput(false);
    jobsMessage.textContent = "Loading jobs...";

    const response = await fetch("/api/v1/jobs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    let children = [jobsTableHeader];

    if (response.status === 200) {
      if (data.count === 0) {
        jobsMessage.textContent = "No jobs found. Add your first job!";
        jobsTable.replaceChildren(...children); // clear this for safety
      } else {
        jobsMessage.textContent = `Found ${data.count} job${data.count === 1 ? '' : 's'}`;
        for (let i = 0; i < data.jobs.length; i++) {
          let rowEntry = document.createElement("tr");
          
          // Create status class based on job status
          const statusClass = `status-${data.jobs[i].status}`;
          
          // Create row content
          rowEntry.innerHTML = `
            <td>${data.jobs[i].company}</td>
            <td>${data.jobs[i].position}</td>
            <td><span class="${statusClass}">${data.jobs[i].status}</span></td>
            <td><button type="button" class="editButton btn btn-primary" data-id="${data.jobs[i]._id}">edit</button></td>
            <td><button type="button" class="deleteButton btn btn-secondary" data-id="${data.jobs[i]._id}">delete</button></td>
          `;
          
          children.push(rowEntry);
        }
        jobsTable.replaceChildren(...children);
      }
    } else {
      jobsMessage.textContent = data.msg;
    }
  } catch (err) {
    console.log(err);
    jobsMessage.textContent = "A communication error occurred.";
  }
  
  enableInput(true);
  setDiv(jobsDiv);
};



