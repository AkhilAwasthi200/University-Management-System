document.addEventListener("DOMContentLoaded", () => {

    // ================= HTML ELEMENTS =================
    // HTML se Search, Dropdowns, Date aur Table select kar rahe hain

    const table = document.querySelector(".academic-table tbody");
    const searches = document.querySelectorAll(
        ".search-input-wrap input, .header-search input"
    );

    const courseFilter = document.getElementById("courseSelect");
    const semesterFilter = document.getElementById("attSemesterSelect");
    const dateFilter = document.getElementById("attendanceDate");
    const clearBtn = document.querySelector('a[href="#filter-clear"]');


    // ================= SEARCH & FILTER =================
    // Search, Course, Semester aur Date ke according records filter karta hai

    function filterAttendance() {

        const searchValues = [...searches].map(input =>
            input.value.toLowerCase()
        );

        const course = courseFilter.value;
        const semester = semesterFilter.value;
        const date = dateFilter.value;

        const semesterNames = [
            "", "i", "ii", "iii", "iv", "v", "vi", "vii"
        ];

        table.querySelectorAll("tr").forEach(row => {

            const text = row.innerText.toLowerCase();

            const searchMatch = searchValues.every(value =>
                !value || text.includes(value)
            );

            const courseMatch =
                !course || text.includes(course.toLowerCase());

            const semesterMatch =
                !semester || text.includes("semester " + semesterNames[semester]);

            const dateMatch =
                !date || row.dataset.date === date;

            row.style.display =
                searchMatch && courseMatch &&
                semesterMatch && dateMatch ? "" : "none";

        });
    }


    // ================= SEARCH EVENT =================
    // Search box mein type karte hi filtering call hoti hai

    searches.forEach(input => {
        input.addEventListener("input", filterAttendance);
    });


    // ================= FILTER EVENTS =================
    // Dropdown aur Date change hone par filtering call hoti hai

    courseFilter.addEventListener("change", filterAttendance);
    semesterFilter.addEventListener("change", filterAttendance);
    dateFilter.addEventListener("change", filterAttendance);


    // ================= CLEAR FILTER =================
    // Search aur saare filters reset karta hai

    clearBtn.addEventListener("click", function(e) {

        e.preventDefault();

        searches.forEach(input => input.value = "");
        courseFilter.value = "";
        semesterFilter.value = "";
        dateFilter.value = "";

        filterAttendance();

    });


    // ================= INITIAL FILTER =================
    // Page load hone par function call hota hai

    filterAttendance();

});