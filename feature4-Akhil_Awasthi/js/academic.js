// ================= COURSES CRUD =================

document.addEventListener("DOMContentLoaded", function () {

    const table = document.querySelector(".academic-table tbody");
    const addBtn = document.querySelector('a[href="#add-course"]');
    const search = document.querySelector('.search-input-wrap input');

    let courses = [];

    // Read existing HTML table data
    function readTable() {
        courses = [];

        table.querySelectorAll("tr").forEach(row => {
            if (row.cells.length < 9) return;

            courses.push({
                code: row.cells[0].innerText.trim(),
                name: row.cells[1].innerText.trim(),
                department: row.cells[2].innerText.trim(),
                faculty: row.cells[3].innerText.trim(),
                credits: row.cells[4].innerText.trim(),
                semester: row.cells[5].innerText.trim(),
                type: row.cells[6].innerText.trim(),
                status: row.cells[7].innerText.trim()
            });
        });
    }

    // Save data
    function saveCourses() {
        localStorage.setItem("courses", JSON.stringify(courses));
    }

    // Display courses
    function displayCourses() {
        table.innerHTML = "";

        courses.forEach((course, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="code-cell">${course.code}</td>
                <td class="primary-text-cell">${course.name}</td>
                <td>${course.department}</td>
                <td>${course.faculty}</td>
                <td class="numeric-cell">${course.credits}</td>
                <td>${course.semester}</td>
                <td><span class="badge badge-info">${course.type}</span></td>
                <td><span class="badge badge-success">${course.status}</span></td>
                <td style="text-align:right;">
                    <div class="action-btn-group">
                        <a href="#view" class="action-btn action-btn-view" data-index="${index}">View</a>
                        <a href="#edit" class="action-btn action-btn-edit" data-index="${index}">Edit</a>
                        <a href="#delete" class="action-btn action-btn-delete" data-index="${index}">Delete</a>
                    </div>
                </td>
            `;

            table.appendChild(row);
        });

        filterCourses();
    }

    // Add course
    function addCourse() {
        const code = prompt("Enter Course Code:");
        if (!code) return;

        const name = prompt("Enter Course Name:");
        if (!name) return;

        const department = prompt("Enter Department:");
        if (!department) return;

        const faculty = prompt("Enter Faculty Name:");
        if (!faculty) return;

        const credits = prompt("Enter Credits:");
        if (!credits) return;

        const semester = prompt("Enter Semester (e.g. Semester III):");
        if (!semester) return;

        const type = prompt("Enter Type (Core / Elective / Practical):");
        if (!type) return;

        courses.push({
            code,
            name,
            department,
            faculty,
            credits,
            semester,
            type,
            status: "Active"
        });

        saveCourses();
        displayCourses();

        alert("Course added successfully!");
    }

    // Edit course
    function editCourse(index) {
        const course = courses[index];

        course.code = prompt("Course Code:", course.code) || course.code;
        course.name = prompt("Course Name:", course.name) || course.name;
        course.department = prompt("Department:", course.department) || course.department;
        course.faculty = prompt("Faculty:", course.faculty) || course.faculty;
        course.credits = prompt("Credits:", course.credits) || course.credits;
        course.semester = prompt("Semester:", course.semester) || course.semester;
        course.type = prompt("Type:", course.type) || course.type;
        course.status = prompt("Status:", course.status) || course.status;

        saveCourses();
        displayCourses();

        alert("Course updated successfully!");
    }

    // Delete course
    function deleteCourse(index) {
        if (confirm("Are you sure you want to delete this course?")) {
            courses.splice(index, 1);

            saveCourses();
            displayCourses();

            alert("Course deleted successfully!");
        }
    }

    // View course
    function viewCourse(index) {
        const course = courses[index];

        alert(
            "Course Details\n\n" +
            "Code: " + course.code + "\n" +
            "Name: " + course.name + "\n" +
            "Department: " + course.department + "\n" +
            "Faculty: " + course.faculty + "\n" +
            "Credits: " + course.credits + "\n" +
            "Semester: " + course.semester + "\n" +
            "Type: " + course.type + "\n" +
            "Status: " + course.status
        );
    }

    // Button actions
    table.addEventListener("click", function (e) {
        const button = e.target.closest("a");
        if (!button) return;

        e.preventDefault();

        const index = Number(button.dataset.index);

        if (button.href.includes("#view")) {
            viewCourse(index);
        }

        if (button.href.includes("#edit")) {
            editCourse(index);
        }

        if (button.href.includes("#delete")) {
            deleteCourse(index);
        }
    });

    // Add button
    addBtn.addEventListener("click", function (e) {
        e.preventDefault();
        addCourse();
    });

    // Search
    function filterCourses() {
        const value = search.value.toLowerCase();

        table.querySelectorAll("tr").forEach(row => {
            row.style.display =
                row.innerText.toLowerCase().includes(value) ? "" : "none";
        });
    }

    search.addEventListener("input", filterCourses);

    // Load saved data
    const saved = localStorage.getItem("courses");

    if (saved) {
        courses = JSON.parse(saved);
        displayCourses();
    } else {
        readTable();
        saveCourses();
    }

});