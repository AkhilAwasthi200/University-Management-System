/* =============================================================================
   student.js  -  Apex Global University UMS  |  Student Module
   Works with: add-student.html, students.html, student-profile.html
   ============================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     1. CONSTANTS
     ------------------------------------------------------------------------- */
  var STORAGE_KEY = 'ums_students_v1';
  var FLASH_KEY = 'ums_flash_message';
  var PAGE_SIZE = 8;
  var FEATURED_ID = '2415000121'; // has the demo attendance / result tables

  var DEPARTMENTS = {
    CSE: { full: 'Computer Science & Engineering', short: 'Computer Science & Eng.' },
    ECE: { full: 'Electronics & Communication', short: 'Electronics & Comm.' },
    ME: { full: 'Mechanical Engineering', short: 'Mechanical Engineering' },
    CE: { full: 'Civil Engineering', short: 'Civil Engineering' },
    IT: { full: 'Information Technology', short: 'Information Technology' },
    BT: { full: 'Biotechnology', short: 'Biotechnology' }
  };

  var COURSES = { BTech: 'B.Tech', MTech: 'M.Tech', BCA: 'BCA', MCA: 'MCA', BSc: 'B.Sc' };

  var STATUSES = {
    active: { label: 'Active', cls: 'badge-active' },
    inactive: { label: 'Inactive', cls: 'badge-inactive' },
    'new': { label: 'New Admission', cls: 'badge-info' },
    graduated: { label: 'Graduated', cls: 'badge-primary' },
    feedue: { label: 'Fee Due', cls: 'badge-warning' }
  };

  var GENDERS = { male: 'Male', female: 'Female', other: 'Other / Prefer not to say' };
  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  var ORDINAL = ['', '1st', '2nd', '3rd', '4th'];

  var AVATAR_STYLES = [
    '',
    'background-color:#fef3c7;color:#92400e;',
    'background-color:#f0fdf4;color:#166534;',
    'background-color:#fff7ed;color:#9a3412;',
    'background-color:#faf5ff;color:#6b21a8;',
    'background-color:#eff6ff;color:#1e40af;',
    'background-color:#f0fdfa;color:#0f766e;',
    'background-color:#fef2f2;color:#991b1b;'
  ];

  /* Starting data = the 8 students already shown in your students.html */
  var SEED_STUDENTS = [
    {
      id: '2415000121', firstName: 'Aditya', lastName: 'Tomar',
      email: 'aditya.tomar@student.apex.edu', dob: '2004-08-14', gender: 'male',
      phone: '+91 98765 43210',
      address: '42 University Avenue, Sector 62, Noida, Uttar Pradesh - 201309',
      department: 'CSE', course: 'BTech', year: '3', semester: '6', admissionYear: '2024',
      guardianName: '', guardianPhone: '', guardianEmail: '',
      status: 'active', cgpa: '8.92 / 10.0'
    },
    seed('2415000111', 'Aarav', 'Patel', 'CSE', '3', '5', 'active'),
    seed('2415000112', 'Priya', 'Nair', 'ECE', '2', '3', 'active'),
    seed('2415000113', 'Rohan', 'Verma', 'ME', '4', '7', 'feedue'),
    seed('2415000114', 'Ananya', 'Sharma', 'IT', '1', '1', 'new'),
    seed('2415000115', 'Vikram', 'Singh', 'CE', '3', '5', 'active'),
    seed('2415000116', 'Sneha', 'Kulkarni', 'BT', '3', '5', 'active'),
    seed('2415000117', 'Kabir', 'Mehta', 'CSE', '3', '5', 'inactive')
  ];

  function seed(id, first, last, dept, year, sem, status) {
    return {
      id: id, firstName: first, lastName: last,
      email: (first + '.' + last).toLowerCase() + '@student.apex.edu',
      dob: '', gender: '', phone: '', address: '',
      department: dept, course: 'BTech', year: year, semester: sem,
      admissionYear: String(2026 - (Number(year) - 1)),
      guardianName: '', guardianPhone: '', guardianEmail: '',
      status: status, cgpa: ''
    };
  }

  /* ---------------------------------------------------------------------------
     2. SMALL HELPERS
     ------------------------------------------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fullName(s) { return (s.firstName + ' ' + s.lastName).trim(); }

  function initials(s) {
    return ((s.firstName || '').charAt(0) + (s.lastName || '').charAt(0)).toUpperCase();
  }

  function avatarStyle(s) {
    var hash = 0, str = String(s.id);
    for (var i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    return AVATAR_STYLES[hash % AVATAR_STYLES.length];
  }

  function formatDate(iso) {
    if (!iso) return 'ΓÇö';
    var p = iso.split('-');
    if (p.length !== 3) return iso;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function orDash(v) { return v ? v : 'ΓÇö'; }
  function deptShort(code) { return DEPARTMENTS[code] ? DEPARTMENTS[code].short : code; }
  function deptFull(code) { return DEPARTMENTS[code] ? DEPARTMENTS[code].full : code; }
  function yearLabel(y) { return ORDINAL[Number(y)] ? ORDINAL[Number(y)] + ' Year' : 'Year ' + y; }
  function semLabel(s) { return ROMAN[Number(s)] ? 'Semester ' + ROMAN[Number(s)] : 'Semester ' + s; }
  function statusInfo(code) { return STATUSES[code] || STATUSES.active; }

  /* ---------------------------------------------------------------------------
     3. STORAGE  (localStorage with a safe fallback)
     ------------------------------------------------------------------------- */
  var memoryStore = null;

  function loadStudents() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        saveStudents(SEED_STUDENTS);
        return JSON.parse(JSON.stringify(SEED_STUDENTS));
      }
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      if (!memoryStore) memoryStore = JSON.parse(JSON.stringify(SEED_STUDENTS));
      return memoryStore;
    }
  }

  function saveStudents(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) { memoryStore = list; }
  }

  function findStudent(id) {
    var list = loadStudents();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function setFlash(msg, type) {
    try { sessionStorage.setItem(FLASH_KEY, JSON.stringify({ msg: msg, type: type || 'success' })); } catch (e) {}
  }

  function takeFlash() {
    try {
      var raw = sessionStorage.getItem(FLASH_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(FLASH_KEY);
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  /* ---------------------------------------------------------------------------
     4. UI EXTRAS (toast + alert box styles injected here, no CSS edit needed)
     ------------------------------------------------------------------------- */
  function injectStyles() {
    var css =
      '.ums-toast{position:fixed;right:1.25rem;bottom:1.25rem;z-index:9999;padding:.8rem 1.1rem;' +
      'border-radius:10px;color:#fff;font-size:.9rem;font-weight:600;box-shadow:0 10px 25px rgba(0,0,0,.2);' +
      'opacity:0;transform:translateY(10px);transition:all .25s ease;max-width:360px}' +
      '.ums-toast.show{opacity:1;transform:translateY(0)}' +
      '.ums-toast.success{background:#16a34a}.ums-toast.error{background:#dc2626}.ums-toast.info{background:#2563eb}' +
      '.ums-alert{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:10px;' +
      'padding:.85rem 1rem;margin-bottom:1.25rem;font-size:.9rem}' +
      '.ums-alert ul{margin:.4rem 0 0 1.1rem;padding:0}' +
      '.ums-invalid{border-color:#dc2626 !important}' +
      '.action-btn-delete{color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;cursor:pointer;font:inherit;' +
      'font-size:.75rem;font-weight:600;padding:.3rem .65rem;border-radius:6px}' +
      '.action-btn-delete:hover{background:#fee2e2}' +
      '.ums-empty{text-align:center;padding:2rem 1rem;color:#64748b}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function toast(message, type) {
    var el = document.createElement('div');
    el.className = 'ums-toast ' + (type || 'success');
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, 3000);
  }

  /* ---------------------------------------------------------------------------
     5. ADD / EDIT STUDENT PAGE
     ------------------------------------------------------------------------- */
  function initAddStudent(form) {
    var params = new URLSearchParams(location.search);
    var editId = params.get('id');
    var editing = null;

    var alertBox = document.createElement('div');
    alertBox.className = 'ums-alert';
    alertBox.setAttribute('role', 'alert');
    alertBox.style.display = 'none';
    form.insertBefore(alertBox, form.firstChild);

    if (editId) {
      editing = findStudent(editId);
      if (!editing) {
        showErrors(['No student found with ID "' + editId + '". You can add a new student instead.']);
      } else {
        switchToEditMode();
        fillForm(editing);
      }
    }

    /* keep semester in step with the year (Year 3 -> Sem 5 or 6) */
    form.elements.studyYear.addEventListener('change', function () {
      var y = Number(form.elements.studyYear.value);
      var s = Number(form.elements.semester.value);
      if (y && (!s || s < 2 * y - 1 || s > 2 * y)) form.elements.semester.value = String(2 * y - 1);
    });

    form.addEventListener('reset', function () {
      hideErrors();
      if (editing) setTimeout(function () { fillForm(editing); }, 0);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideErrors();

      var data = readForm();
      var errors = validate(data);
      if (errors.length) { showErrors(errors); return; }

      var list = loadStudents();
      var record = {
        id: data.studentId,
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, dob: data.dob, gender: data.gender,
        phone: data.phone, address: data.address,
        department: data.department, course: data.course,
        year: data.studyYear, semester: data.semester, admissionYear: data.admissionYear,
        guardianName: data.guardianName, guardianPhone: data.guardianPhone, guardianEmail: data.guardianEmail
      };

      if (editing) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === editing.id) {
            // keep fields the form does not edit (status, CGPA)
            record.status = list[i].status;
            record.cgpa = list[i].cgpa || '';
            list[i] = record;
            break;
          }
        }
        saveStudents(list);
        setFlash('Student "' + fullName(record) + '" updated successfully.');
      } else {
        record.status = record.admissionYear === String(new Date().getFullYear()) ? 'new' : 'active';
        record.cgpa = '';
        list.unshift(record);
        saveStudents(list);
        setFlash('Student "' + fullName(record) + '" added successfully.');
      }
      window.location.href = 'students.html';
    });

    function readForm() {
      var out = {};
      $$('input, select, textarea', form).forEach(function (el) {
        if (el.name) out[el.name] = (el.value || '').trim();
      });
      return out;
    }

    function fillForm(s) {
      var map = {
        firstName: s.firstName, lastName: s.lastName, dob: s.dob, gender: s.gender,
        email: s.email, phone: s.phone, address: s.address,
        studentId: s.id, department: s.department, course: s.course,
        studyYear: s.year, semester: s.semester, admissionYear: s.admissionYear,
        guardianName: s.guardianName, guardianPhone: s.guardianPhone, guardianEmail: s.guardianEmail
      };
      Object.keys(map).forEach(function (name) {
        var el = form.elements[name];
        if (!el) return;
        var val = map[name] == null ? '' : String(map[name]);
        if (el.tagName === 'SELECT' && val && !$$('option', el).some(function (o) { return o.value === val; })) {
          var opt = document.createElement('option');
          opt.value = val; opt.textContent = val;
          el.appendChild(opt);
        }
        el.value = val;
      });
    }

    function switchToEditMode() {
      var idField = form.elements.studentId;
      idField.readOnly = true;
      idField.style.backgroundColor = '#f1f5f9';
      idField.title = 'Student ID cannot be changed';

      var h1 = $('.page-title-wrap h1'); if (h1) h1.textContent = 'Edit Student';
      var p = $('.page-title-wrap p'); if (p) p.textContent = 'Update the personal, academic, and guardian records of this student.';
      var ht = $('.header-page-title'); if (ht) ht.textContent = 'Edit Student';
      var bc = $('.breadcrumb-current'); if (bc) bc.textContent = 'Edit Student';
      document.title = 'Edit Student | Apex Global University UMS';

      var btn = $('button[type="submit"]', form);
      if (btn && btn.lastChild && btn.lastChild.nodeType === 3) btn.lastChild.textContent = ' Update Student';
    }

    function validate(d) {
      var errors = [];
      $$('.ums-invalid', form).forEach(function (el) { el.classList.remove('ums-invalid'); });

      function bad(field, msg) {
        errors.push(msg);
        if (form.elements[field]) form.elements[field].classList.add('ums-invalid');
      }

      if (!/^[A-Za-z][A-Za-z .'-]{0,49}$/.test(d.firstName)) bad('firstName', 'First name should contain letters only.');
      if (!/^[A-Za-z][A-Za-z .'-]{0,49}$/.test(d.lastName)) bad('lastName', 'Last name should contain letters only.');

      if (d.dob) {
        var dob = new Date(d.dob);
        var today = new Date();
        var age = today.getFullYear() - dob.getFullYear();
        if (dob > today) bad('dob', 'Date of birth cannot be in the future.');
        else if (age < 15 || age > 80) bad('dob', 'Please check the date of birth (age should be between 15 and 80).');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) bad('email', 'Please enter a valid student email address.');
      if (d.phone.replace(/\D/g, '').length < 10 || d.phone.replace(/\D/g, '').length > 13) {
        bad('phone', 'Student phone number should have 10 to 13 digits.');
      }
      if (d.guardianPhone.replace(/\D/g, '').length < 10 || d.guardianPhone.replace(/\D/g, '').length > 13) {
        bad('guardianPhone', 'Guardian phone number should have 10 to 13 digits.');
      }
      if (d.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.guardianEmail)) {
        bad('guardianEmail', 'Guardian email address is not valid.');
      }
      if (!/^[A-Za-z0-9-]{4,20}$/.test(d.studentId)) {
        bad('studentId', 'Student ID should be 4-20 characters (letters, numbers, hyphen).');
      }

      var year = Number(d.studyYear), sem = Number(d.semester);
      if (year && sem && (sem < 2 * year - 1 || sem > 2 * year)) {
        bad('semester', 'Year ' + year + ' can only have Semester ' + (2 * year - 1) + ' or ' + (2 * year) + '.');
      }

      // duplicates
      var list = loadStudents();
      list.forEach(function (s) {
        var isSelf = editing && s.id === editing.id;
        if (isSelf) return;
        if (s.id.toLowerCase() === d.studentId.toLowerCase()) bad('studentId', 'Student ID "' + d.studentId + '" already exists.');
        if (s.email.toLowerCase() === d.email.toLowerCase()) bad('email', 'Email "' + d.email + '" is already used by another student.');
      });

      return errors;
    }

    function showErrors(errors) {
      alertBox.innerHTML = '<strong>Please fix the following:</strong><ul>' +
        errors.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>';
      alertBox.style.display = 'block';
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideErrors() { alertBox.style.display = 'none'; alertBox.innerHTML = ''; }
  }

  /* ---------------------------------------------------------------------------
     6. STUDENT LIST PAGE
     ------------------------------------------------------------------------- */
  function initStudentList() {
    var tbody = $('.student-table tbody');
    var searchInput = $('.search-input-wrap input');
    var selects = $$('.student-filter-grid select');
    var deptSel = selects[0], yearSel = selects[1], statusSel = selects[2];
    var buttons = $$('.filter-button-group a');
    var searchBtn = buttons[0], resetBtn = buttons[1];
    var headerSearch = $('.header-search input');
    var countBadge = $('.student-table-header .badge');
    var info = $('.pagination-info');
    var pager = $('.pagination');
    var statValues = $$('.student-stat-card .stat-value');

    var state = { page: 1 };

    var q = new URLSearchParams(location.search).get('q');
    if (q) { searchInput.value = q; if (headerSearch) headerSearch.value = q; }

    var flash = takeFlash();
    if (flash) toast(flash.msg, flash.type);

    function getFiltered() {
      var term = searchInput.value.trim().toLowerCase();
      return loadStudents().filter(function (s) {
        if (term) {
          var hay = (fullName(s) + ' ' + s.id + ' ' + s.email).toLowerCase();
          if (hay.indexOf(term) === -1) return false;
        }
        if (deptSel.value && s.department !== deptSel.value) return false;
        if (yearSel.value && String(s.year) !== yearSel.value) return false;
        if (statusSel.value && s.status !== statusSel.value) return false;
        return true;
      });
    }

    function renderStats() {
      var all = loadStudents();
      var counts = { total: all.length, active: 0, 'new': 0, graduated: 0 };
      all.forEach(function (s) {
        if (s.status === 'active') counts.active++;
        if (s.status === 'new') counts['new']++;
        if (s.status === 'graduated') counts.graduated++;
      });
      var values = [counts.total, counts.active, counts['new'], counts.graduated];
      statValues.forEach(function (el, i) {
        if (values[i] !== undefined) el.textContent = values[i].toLocaleString('en-IN');
      });
    }

    function rowHtml(s) {
      var st = statusInfo(s.status);
      var style = avatarStyle(s);
      var enc = encodeURIComponent(s.id);
      return '<tr>' +
        '<td class="code-cell">' + esc(s.id) + '</td>' +
        '<td><div class="student-name-cell">' +
          '<div class="student-avatar-badge"' + (style ? ' style="' + style + '"' : '') + '>' + esc(initials(s)) + '</div>' +
          '<div class="student-info-meta">' +
            '<span class="student-full-name">' + esc(fullName(s)) + '</span>' +
            '<span class="student-email-sub">Enrollment No. ' + esc(s.id) + '</span>' +
          '</div></div></td>' +
        '<td>' + esc(s.email) + '</td>' +
        '<td>' + esc(deptShort(s.department)) + '</td>' +
        '<td>' + esc(yearLabel(s.year)) + '</td>' +
        '<td>' + esc(semLabel(s.semester)) + '</td>' +
        '<td><span class="badge ' + st.cls + '">' + esc(st.label) + '</span></td>' +
        '<td style="text-align:right;"><div class="action-btn-group">' +
          '<a href="student-profile.html?id=' + enc + '" class="action-btn action-btn-view" title="View Profile">View</a>' +
          '<a href="add-student.html?id=' + enc + '" class="action-btn action-btn-edit" title="Edit Student">Edit</a>' +
          '<button type="button" class="action-btn-delete" data-delete="' + esc(s.id) + '" title="Delete Student">Delete</button>' +
        '</div></td></tr>';
    }

    function render() {
      var rows = getFiltered();
      var pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
      if (state.page > pages) state.page = pages;
      var start = (state.page - 1) * PAGE_SIZE;
      var slice = rows.slice(start, start + PAGE_SIZE);

      tbody.innerHTML = slice.length
        ? slice.map(rowHtml).join('')
        : '<tr><td colspan="8" class="ums-empty">No students match your search.</td></tr>';

      if (countBadge) countBadge.textContent = 'Showing ' + slice.length + ' of ' + rows.length.toLocaleString('en-IN') + ' Records';
      if (info) {
        info.innerHTML = slice.length
          ? 'Showing <strong>' + (start + 1) + '</strong> to <strong>' + (start + slice.length) +
            '</strong> of <strong>' + rows.length.toLocaleString('en-IN') + '</strong> registered students'
          : 'No students found';
      }
      renderPager(pages);
      renderStats();
    }

    function renderPager(pages) {
      if (!pager) return;
      function item(label, page, cls, aria) {
        return '<li class="page-item ' + (cls || '') + '"><a href="#" class="page-link" data-page="' + page + '"' +
          (aria ? ' aria-label="' + aria + '"' : '') + '>' + label + '</a></li>';
      }
      var html = item('&laquo; Prev', state.page - 1, state.page === 1 ? 'disabled' : '', 'Previous');
      for (var p = 1; p <= pages; p++) {
        // show first, last, and 2 pages either side of the current one
        if (p === 1 || p === pages || Math.abs(p - state.page) <= 2) {
          html += item(p, p, p === state.page ? 'active' : '');
        } else if (Math.abs(p - state.page) === 3) {
          html += '<li class="page-item disabled"><a href="#" class="page-link" data-page="0">&hellip;</a></li>';
        }
      }
      html += item('Next &raquo;', state.page + 1, state.page === pages ? 'disabled' : '', 'Next');
      pager.innerHTML = html;
    }

    /* events */
    pager.addEventListener('click', function (e) {
      var link = e.target.closest('.page-link');
      if (!link) return;
      e.preventDefault();
      var page = Number(link.getAttribute('data-page'));
      if (!page || link.parentNode.classList.contains('disabled')) return;
      state.page = page;
      render();
    });

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-delete]');
      if (!btn) return;
      var id = btn.getAttribute('data-delete');
      var s = findStudent(id);
      if (!s) return;
      if (!confirm('Delete student "' + fullName(s) + '" (' + id + ')? This cannot be undone.')) return;
      saveStudents(loadStudents().filter(function (x) { return x.id !== id; }));
      toast('Student "' + fullName(s) + '" deleted.', 'info');
      render();
    });

    function applyFilters(e) { if (e) e.preventDefault(); state.page = 1; render(); }

    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') applyFilters(e); });
    [deptSel, yearSel, statusSel].forEach(function (el) { el.addEventListener('change', applyFilters); });

    resetBtn.addEventListener('click', function (e) {
      e.preventDefault();
      searchInput.value = '';
      if (headerSearch) headerSearch.value = '';
      deptSel.value = yearSel.value = statusSel.value = '';
      state.page = 1;
      render();
    });

    if (headerSearch) {
      headerSearch.addEventListener('input', function () {
        searchInput.value = headerSearch.value;
        applyFilters();
      });
    }

    render();
  }

  /* ---------------------------------------------------------------------------
     7. STUDENT PROFILE PAGE
     ------------------------------------------------------------------------- */
  function initProfile() {
    var main = $('main.student-main');
    var id = new URLSearchParams(location.search).get('id') || FEATURED_ID;
    var s = findStudent(id);

    if (!s) {
      main.innerHTML =
        '<div class="card"><div class="card-body" style="text-align:center;padding:2.5rem 1rem;">' +
        '<h2 style="margin-bottom:.5rem;">Student not found</h2>' +
        '<p class="text-muted" style="margin-bottom:1.25rem;">No student exists with ID "' + esc(id) + '".</p>' +
        '<a href="students.html" class="btn btn-primary">&larr; Back to Students</a></div></div>';
      return;
    }

    var st = statusInfo(s.status);
    document.title = fullName(s) + ' | Student Profile | Apex Global University UMS';

    /* hero card */
    var avatar = $('.profile-avatar-large'); if (avatar) avatar.textContent = initials(s);
    var h2 = $('.profile-title-group h2'); if (h2) h2.textContent = fullName(s);
    var meta = $('.profile-meta-tags');
    if (meta) {
      meta.innerHTML =
        '<span><strong>Student ID:</strong> ' + esc(s.id) + '</span><span>&bull;</span>' +
        '<span><strong>Department:</strong> ' + esc(deptFull(s.department)) + '</span><span>&bull;</span>' +
        '<span><strong>Year:</strong> ' + esc(yearLabel(s.year)) + ' (' + esc(semLabel(s.semester)) + ')</span>' +
        '<span class="profile-status-pill"><span class="status-dot"></span>Current Status: ' + esc(st.label) + '</span>';
    }
    var editBtn = $('.profile-action-btns a[href^="add-student.html"]');
    if (editBtn) editBtn.href = 'add-student.html?id=' + encodeURIComponent(s.id);

    /* info cards */
    function setInfo(label, value) {
      $$('.info-item').forEach(function (item) {
        var l = $('.info-label', item);
        if (l && l.textContent.trim() === label) {
          var v = $('.info-value', item);
          if (v) v.textContent = value;
        }
      });
    }
    var course = (COURSES[s.course] || s.course) + ' (' + s.department + ')';

    setInfo('Full Name', fullName(s));
    setInfo('Date of Birth', formatDate(s.dob));
    setInfo('Gender', GENDERS[s.gender] || 'ΓÇö');
    setInfo('Phone Number', orDash(s.phone));
    setInfo('Email Address', orDash(s.email));
    setInfo('Residential Address', orDash(s.address));
    setInfo('Student ID', s.id);
    setInfo('Department', deptShort(s.department));
    setInfo('Degree Course', course);
    setInfo('Current Year & Semester', yearLabel(s.year) + ' \u2022 ' + semLabel(s.semester));
    setInfo('Admission Year', orDash(s.admissionYear));
    setInfo('Cumulative CGPA', s.cgpa ? s.cgpa : 'Not available yet');

    /* guardian card (only when guardian details were entered) */
    var grid = $('.profile-details-grid');
    if (grid && (s.guardianName || s.guardianPhone || s.guardianEmail)) {
      var card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '1.75rem';
      card.innerHTML =
        '<div class="card-header"><div class="card-title">Parent / Guardian Information</div></div>' +
        '<div class="card-body"><div class="info-list-grid">' +
        guardianItem('Guardian Name', s.guardianName) +
        guardianItem('Guardian Phone', s.guardianPhone) +
        guardianItem('Guardian Email', s.guardianEmail) +
        '</div></div>';
      grid.parentNode.insertBefore(card, grid.nextSibling);
    }

    function guardianItem(label, value) {
      return '<div class="info-item"><span class="info-label">' + label + '</span>' +
        '<span class="info-value">' + esc(orDash(value)) + '</span></div>';
    }

    /* attendance / exam tables are demo data for the featured student only */
    if (s.id !== FEATURED_ID) {
      var cards = $$('.card', main).filter(function (c) {
        var t = $('.card-title', c);
        return t && /Attendance|Examination/i.test(t.textContent);
      });
      cards.forEach(function (c, i) {
        if (i === 0) {
          c.innerHTML =
            '<div class="card-header"><div class="card-title">Attendance & Examination Records</div></div>' +
            '<div class="card-body"><p class="text-muted" style="margin:0;">' +
            'No attendance or examination records are available for this student yet.</p></div>';
        } else {
          c.remove();
        }
      });
    }
  }

  /* ---------------------------------------------------------------------------
     8. TOP-BAR SEARCH (on pages other than the student list)
     ------------------------------------------------------------------------- */
  function initHeaderSearch() {
    var input = $('.header-search input');
    if (!input || $('.student-filter-card')) return; // list page handles its own
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && input.value.trim()) {
        window.location.href = 'students.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  }

  /* ---------------------------------------------------------------------------
     9. START
     ------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    loadStudents(); // makes sure sample data exists

    var form = $('#studentForm') || $('.form-card form');
    if (form) initAddStudent(form);
    if ($('.student-filter-card') && $('.student-table tbody')) initStudentList();
    if ($('.profile-header-card')) initProfile();
    initHeaderSearch();
  });
})();
