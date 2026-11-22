// =====================================
// APEX GLOBAL UNIVERSITY - FACULTY MODULE
// =====================================

// Get data from LocalStorage
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Save data in LocalStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Convert HTML special characters into safe text
function safeText(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    const chars = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return chars[char];
  });
}

// =====================================
// FACULTY MANAGEMENT
// =====================================

const facultyTable = document.querySelector(".faculty-table tbody");

let faculty = getData("facultyData");

// Read existing HTML records for first-time use
if (
  facultyTable &&
  facultyTable
    .querySelector("td.code-cell")
    ?.textContent.trim()
    .startsWith("FAC") &&
  faculty.length === 0
) {
  const rows = facultyTable.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    faculty.push({
      id: cells[0].textContent.trim(),
      name: cells[1].querySelector(".faculty-full-name").textContent.trim(),
      email: cells[2].textContent.trim(),
      department: cells[3].textContent.trim(),
      designation: cells[4].textContent.trim(),
      experience: cells[5].textContent.trim(),
      status: cells[6].textContent.trim(),
    });
  });

  saveData("facultyData", faculty);
}

// Display faculty records
function displayFaculty(data = faculty) {
  if (!facultyTable) return;

  facultyTable.innerHTML = "";

  data.forEach((member) => {
    let index = faculty.indexOf(member);

    let row = document.createElement("tr");

    row.innerHTML = `
            <td class="code-cell">${safeText(member.id)}</td>

            <td>
                <div class="faculty-name-cell">
                    <div class="faculty-avatar-badge"
                         style="background:#eff6ff;color:#1e40af">
                        ${safeText(initials)}
                    </div>

                    <div class="faculty-info-meta">
                        <span class="faculty-full-name">
                            ${safeText(member.name)}
                        </span>
                        <span class="faculty-id-sub">
                            ${safeText(member.department)}
                        </span>
                    </div>
                </div>
            </td>

            <td>${safeText(member.email)}</td>
            <td>${safeText(member.department)}</td>
            <td><span class="badge badge-purple">
                ${safeText(member.designation)}
            </span></td>
            <td>${safeText(member.experience)}</td>

            <td>
                <span class="badge ${member.status === "Active" ? "badge-active" : "badge-onleave"}">
                    ${safeText(member.status)}
                </span>
            </td>

            <td>
                <div class="action-btn-group">
                    <a href="faculty-profile.html?id=${encodeURIComponent(member.id)}"
                       class="action-btn action-btn-view">
                        View
                    </a>

                    <button class="action-btn action-btn-edit"
                            data-action="edit"
                            data-index="${index}">
                        Edit
                    </button>

                    <button class="action-btn action-btn-edit"
                            data-action="delete"
                            data-index="${index}">
                        Delete
                    </button>
                </div>
            </td>
        `;

    facultyTable.appendChild(row);
  });

  updateFacultyStats();
}

// Add faculty member
function addFaculty() {
  let name = prompt("Enter Faculty Name:");
  if (!name || !name.trim()) return;

  let email = prompt("Enter Faculty Email:");
  if (!email || !email.trim()) return;

  let department = prompt("Enter Department:");
  if (!department || !department.trim()) return;

  let designation = prompt("Enter Designation:");
  if (!designation || !designation.trim()) return;

  let experience = prompt("Enter Experience (Example: 5 Years):");
  if (!experience || !experience.trim()) return;

  let id = "FAC-" + Date.now();

  faculty.push({
    id: id,
    name: name.trim(),
    email: email.trim(),
    department: department.trim(),
    designation: designation.trim(),
    experience: experience.trim(),
    status: "Active",
  });

  saveData("facultyData", faculty);
  displayFaculty();

  alert("Faculty added successfully!");
}

// Edit faculty member
function editFaculty(index) {
  let member = faculty[index];

  let name = prompt("Enter Faculty Name:", member.name);
  if (!name || !name.trim()) return;

  let email = prompt("Enter Email:", member.email);
  if (!email || !email.trim()) return;

  let department = prompt("Enter Department:", member.department);
  if (!department || !department.trim()) return;

  let designation = prompt("Enter Designation:", member.designation);
  if (!designation || !designation.trim()) return;

  let experience = prompt("Enter Experience:", member.experience);
  if (!experience || !experience.trim()) return;

  faculty[index].name = name.trim();
  faculty[index].email = email.trim();
  faculty[index].department = department.trim();
  faculty[index].designation = designation.trim();
  faculty[index].experience = experience.trim();

  saveData("facultyData", faculty);
  displayFaculty();

  alert("Faculty updated successfully!");
}

// Delete faculty member
function deleteFaculty(index) {
  let confirmDelete = confirm(
    "Are you sure you want to delete this faculty member?",
  );

  if (confirmDelete) {
    faculty.splice(index, 1);

    saveData("facultyData", faculty);
    displayFaculty();

    alert("Faculty deleted successfully!");
  }
}

// Update faculty statistics
function updateFacultyStats() {
  const values = document.querySelectorAll(".faculty-stats-grid .stat-value");

  if (
    values.length !== 4 ||
    facultyTable
      ?.querySelector("td.code-cell")
      ?.textContent.trim()
      .startsWith("DEP")
  )
    return;

  let professors = faculty.filter(
    (f) =>
      f.designation.toLowerCase().includes("professor") &&
      !f.designation.toLowerCase().includes("assistant") &&
      !f.designation.toLowerCase().includes("associate"),
  ).length;

  let associate = faculty.filter((f) =>
    f.designation.toLowerCase().includes("associate"),
  ).length;

  let assistant = faculty.filter((f) =>
    f.designation.toLowerCase().includes("assistant"),
  ).length;

  values[0].textContent = faculty.length;
  values[1].textContent = professors;
  values[2].textContent = associate;
  values[3].textContent = assistant;
}

// Faculty table button events
if (
  facultyTable &&
  facultyTable
    .querySelector("td.code-cell")
    ?.textContent.trim()
    .startsWith("FAC")
) {
  displayFaculty();

  facultyTable.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    let index = Number(button.dataset.index);

    if (button.dataset.action === "edit") {
      editFaculty(index);
    }

    if (button.dataset.action === "delete") {
      deleteFaculty(index);
    }
  });

  // Search faculty
  const searchInput = document.querySelector(".header-search input");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      let searchValue = this.value.toLowerCase();

      let filteredFaculty = faculty.filter(
        (member) =>
          member.name.toLowerCase().includes(searchValue) ||
          member.email.toLowerCase().includes(searchValue) ||
          member.department.toLowerCase().includes(searchValue) ||
          member.id.toLowerCase().includes(searchValue),
      );

      displayFaculty(filteredFaculty);
    });
  }

  // Add faculty button
  const addButton = document.querySelector('a[href="#add-faculty"]');

  if (addButton) {
    addButton.addEventListener("click", function (event) {
      event.preventDefault();
      addFaculty();
    });
  }
}

// =====================================
// FACULTY PROFILE
// =====================================

const profileHeader = document.querySelector(".faculty-profile-header");

if (profileHeader) {
  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get("id");

  const selectedFaculty =
    faculty.find((member) => member.id === selectedId) || faculty[0];

  if (selectedFaculty) {
    const heading = profileHeader.querySelector("h1");
    const idElement = profileHeader.querySelector("div div");

    if (heading) heading.textContent = selectedFaculty.name;

    const profileText = profileHeader.querySelectorAll("div div");

    if (profileText[0]) profileText[0].textContent = selectedFaculty.id;

    if (profileHeader.querySelector("p")) {
      profileHeader.querySelector("p").textContent =
        selectedFaculty.designation + " • " + selectedFaculty.department;
    }

    // Update personal information
    const infoCards = document.querySelectorAll("main strong");

    if (infoCards.length >= 6) {
      infoCards[0].textContent = selectedFaculty.id;
      infoCards[1].textContent = selectedFaculty.designation;
      infoCards[2].textContent = selectedFaculty.department;
      infoCards[4].textContent = selectedFaculty.email;
    }
  }
}

// =====================================
// DEPARTMENT MANAGEMENT
// =====================================

let departmentTable = document.querySelector(".faculty-table tbody");

let departments = getData("departmentData");

const isDepartmentPage =
  departmentTable &&
  departmentTable
    .querySelector("td.code-cell")
    ?.textContent.trim()
    .startsWith("DEP");

if (isDepartmentPage) {
  if (departments.length === 0) {
    departmentTable.querySelectorAll("tr").forEach((row) => {
      let cells = row.querySelectorAll("td");

      departments.push({
        id: cells[0].textContent.trim(),
        name: cells[1].querySelector(".faculty-full-name").textContent.trim(),
        shortName: cells[1].querySelector(".faculty-id-sub").textContent.trim(),
        hod: cells[2].textContent.trim(),
        faculty: cells[3].textContent.trim(),
        students: cells[4].textContent.trim(),
        courses: cells[5].textContent.trim(),
        status: cells[6].textContent.trim(),
      });
    });

    saveData("departmentData", departments);
  }

  // Display departments
  function displayDepartments(data = departments) {
    departmentTable.innerHTML = "";

    data.forEach(department => {
      let index = departments.indexOf(department);
      let row = document.createElement("tr");

      row.innerHTML = `
                <td class="code-cell">${safeText(department.id)}</td>

                <td>
                    <div class="faculty-name-cell">
                        <div class="faculty-avatar-badge"
                             style="background:#eff6ff;color:#1d4ed8">
                            ${safeText(department.shortName)}
                        </div>

                        <div class="faculty-info-meta">
                            <span class="faculty-full-name">
                                ${safeText(department.name)}
                            </span>
                            <span class="faculty-id-sub">
                                ${safeText(department.shortName)}
                            </span>
                        </div>
                    </div>
                </td>

                <td>${safeText(department.hod)}</td>
                <td>${safeText(department.faculty)}</td>
                <td>${safeText(department.students)}</td>
                <td>${safeText(department.courses)}</td>

                <td>
                    <span class="badge badge-active">
                        ${safeText(department.status)}
                    </span>
                </td>

                <td>
                    <div class="action-btn-group">
                        <a href="faculty.html" class="action-btn action-btn-view">
                            Faculty
                        </a>

                        <button class="action-btn action-btn-edit"
                                data-department="${index}">
                            View
                        </button>
                    </div>
                </td>
            `;

      departmentTable.appendChild(row);
    });

    updateDepartmentStats();
  }

  // Add new department
  function addDepartment() {
    let name = prompt("Enter Department Name:");
    if (!name || !name.trim()) return;

    let shortName = prompt("Enter Department Code:");
    if (!shortName || !shortName.trim()) return;

    let hod = prompt("Enter Head of Department:");
    if (!hod || !hod.trim()) return;

    let id = "DEP-" + String(Date.now()).slice(-6);

    departments.push({
      id: id,
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      hod: hod.trim(),
      faculty: "0",
      students: "0",
      courses: "0",
      status: "Active",
    });

    saveData("departmentData", departments);
    displayDepartments();

    alert("Department added successfully!");
  }

  // Update department statistics
  function updateDepartmentStats() {
    const values = document.querySelectorAll(".faculty-stats-grid .stat-value");

    if (values.length === 4) {
      values[0].textContent = departments.length;
    }
  }

  // Search departments
  const searchInput = document.querySelector(".header-search input");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      let value = this.value.toLowerCase();

      let filtered = departments.filter(
        (department) =>
          department.name.toLowerCase().includes(value) ||
          department.shortName.toLowerCase().includes(value) ||
          department.hod.toLowerCase().includes(value),
      );

      displayDepartments(filtered);
    });
  }

  // Add department button
  const addButton = document.querySelector('a[href="#add-department"]');

  if (addButton) {
    addButton.addEventListener("click", function (event) {
      event.preventDefault();
      addDepartment();
    });
  }

  // View department information
  departmentTable.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-department]");

    if (!button) return;

    let department = departments[Number(button.dataset.department)];

    alert(
      "Department: " +
        department.name +
        "\nHOD: " +
        department.hod +
        "\nFaculty: " +
        department.faculty +
        "\nStudents: " +
        department.students +
        "\nCourses: " +
        department.courses,
    );
  });

  displayDepartments();
}
