document.addEventListener("DOMContentLoaded", () => {

    // ================= HTML ELEMENTS =================
    // HTML se table, search, filters aur modal select kar rahe hain

    const table = document.querySelector(".academic-table tbody");
    const addBtn = document.querySelector('a[href="#add-course"]');
    const search = document.querySelector(".search-input-wrap input");

    const modal = document.getElementById("courseModal");
    const form = document.getElementById("courseForm");

    const departmentFilter = document.getElementById("departmentFilter");
    const semesterFilter = document.getElementById("semesterFilter");
    const typeFilter = document.getElementById("typeFilter");
    const resetBtn = document.querySelector('a[href="#reset-filters"]');

    const fields = [
        "code", "name", "department", "faculty",
        "credits", "semester", "type", "status"
    ];

    // HTML form ke input fields ko select kar rahe hain
    const inputs = fields.map(field =>
        document.getElementById(
            "course" + field.charAt(0).toUpperCase() + field.slice(1)
        )
    );

    let courses = [];
    let editIndex = null;


    // ================= READ INITIAL HTML DATA =================
    // HTML table ke existing records ko JavaScript array mein read karta hai

    function readTable() {
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


    // ================= SAVE DATA =================
    // Courses array ko LocalStorage mein JSON format mein save karta hai

    function save() {
        localStorage.setItem("courses", JSON.stringify(courses));
    }


    // ================= DISPLAY COURSES =================
    // JavaScript data ko HTML table mein display karta hai

    function display() {
        table.innerHTML = courses.map((c, i) => `
            <tr>
                <td class="code-cell">${c.code}</td>
                <td class="primary-text-cell">${c.name}</td>
                <td>${c.department}</td>
                <td>${c.faculty}</td>
                <td class="numeric-cell">${c.credits}</td>
                <td>${c.semester}</td>
                <td><span class="badge badge-info">${c.type}</span></td>
                <td><span class="badge badge-success">${c.status}</span></td>

                <td style="text-align:right">
                    <div class="action-btn-group">
                        <a href="#view" class="action-btn action-btn-view" data-index="${i}">View</a>
                        <a href="#edit" class="action-btn action-btn-edit" data-index="${i}">Edit</a>
                        <a href="#delete" class="action-btn action-btn-delete" data-index="${i}">Delete</a>
                    </div>
                </td>
            </tr>
        `).join("");

        filter();
    }


    // ================= OPEN FORM =================
    // Add ya Edit ke liye modal form open karta hai

    function openModal(course = null) {
        form.reset();

        editIndex = course ? courses.indexOf(course) : null;

        fields.forEach((field, i) => {
            inputs[i].value = course ? course[field] : "";
        });

        document.getElementById("modalTitle").textContent =
            course ? "Edit Course" : "Add New Course";

        document.getElementById("saveCourseBtn").textContent =
            course ? "Update Course" : "Save Course";

        modal.classList.add("active");
    }


    // ================= CLOSE FORM =================
    // Modal close karta hai aur form reset karta hai

    function closeModal() {
        modal.classList.remove("active");
        form.reset();
        editIndex = null;
    }


    // ================= ADD COURSE =================
    // Add New Course HTML button click hone par form open hota hai

    addBtn.addEventListener("click", e => {
        e.preventDefault();
        openModal();
    });


    // ================= ADD / UPDATE COURSE =================
    // Form submit hone par naya course add ya existing course update hota hai

    form.addEventListener("submit", e => {
        e.preventDefault();

        const course = Object.fromEntries(
            fields.map((field, i) => [field, inputs[i].value.trim()])
        );

        if (editIndex !== null) {
            courses[editIndex] = course;
            alert("Course updated successfully!");
        } else {
            courses.push(course);
            alert("Course added successfully!");
        }

        save();
        display();
        closeModal();
    });


    // ================= TABLE ACTIONS =================
    // View, Edit aur Delete buttons ko handle karta hai
    // Event Delegation: ek listener poori table par lagaya hai

    table.addEventListener("click", e => {
        const btn = e.target.closest("a");
        if (!btn) return;

        e.preventDefault();

        const index = Number(btn.dataset.index);
        const course = courses[index];

        // View button: course details show karta hai
        if (btn.classList.contains("action-btn-view")) {
            alert(fields.map(field =>
                field.charAt(0).toUpperCase() + field.slice(1) +
                ": " + course[field]
            ).join("\n"));
        }

        // Edit button: existing data form mein fill karta hai
        if (btn.classList.contains("action-btn-edit")) {
            openModal(course);
        }

        // Delete button: record delete karta hai
        if (btn.classList.contains("action-btn-delete") &&
            confirm("Are you sure you want to delete this course?")) {

            courses.splice(index, 1);
            save();
            display();

            alert("Course deleted successfully!");
        }
    });


    // ================= SEARCH & FILTER =================
    // Search, Department, Semester aur Type filters ek saath work karte hain

    function filter() {
        const searchValue = search.value.toLowerCase();
        const department = departmentFilter.value;
        const semester = semesterFilter.value;
        const type = typeFilter.value;

        const departmentNames = {
            CSE: "computer science",
            ECE: "electronics",
            ME: "mechanical",
            CE: "civil",
            IT: "information technology",
            BT: "biotechnology"
        };

        const semesterNames = [
            "", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii"
        ];

        table.querySelectorAll("tr").forEach(row => {
            const text = row.innerText.toLowerCase();

            const searchMatch =
                !searchValue || text.includes(searchValue);

            const departmentMatch =
                !department ||
                text.includes(
                    (departmentNames[department] || department).toLowerCase()
                );

            const semesterMatch =
                !semester ||
                text.includes("semester " + semesterNames[semester]);

            const typeMatch =
                !type || text.includes(type.toLowerCase());

            row.style.display =
                searchMatch && departmentMatch &&
                semesterMatch && typeMatch ? "" : "none";
        });
    }


    // Search input change hone par filter call hota hai
    search.addEventListener("input", filter);

    // Dropdown change hone par filter call hota hai
    departmentFilter.addEventListener("change", filter);
    semesterFilter.addEventListener("change", filter);
    typeFilter.addEventListener("change", filter);


    // ================= RESET FILTERS =================
    // Reset Filters button search aur dropdowns clear karta hai

    resetBtn.addEventListener("click", e => {
        e.preventDefault();

        search.value = "";
        departmentFilter.value = "";
        semesterFilter.value = "";
        typeFilter.value = "";

        filter();
    });


    // ================= MODAL BUTTONS =================
    // Close (X), Cancel aur modal ke outside click se modal close hota hai

    document.getElementById("closeModal")
        .addEventListener("click", closeModal);

    document.getElementById("cancelModal")
        .addEventListener("click", closeModal);

    modal.addEventListener("click", e => {
        if (e.target === modal) closeModal();
    });


    // ================= LOAD SAVED DATA =================
    // LocalStorage se data load karta hai
    // Agar data nahi hai, toh original HTML table se read karta hai

    const saved = localStorage.getItem("courses");

    if (saved) {
        courses = JSON.parse(saved);
    } else {
        readTable();
        save();
    }

    // Page load hone par table display karta hai
    display();

});