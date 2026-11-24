(() => {
	"use strict";

	const menuToggle = document.getElementById("menuToggle");
	const sidebar = document.getElementById("appSidebar");
	const overlay = document.getElementById("sidebarOverlay");

	function setSidebarOpen(open) {
		sidebar.classList.toggle("show", open);
		overlay.classList.toggle("show", open);
		menuToggle.setAttribute("aria-expanded", String(open));
	}

	menuToggle.addEventListener("click", () => {
		setSidebarOpen(!sidebar.classList.contains("show"));
	});
	overlay.addEventListener("click", () => setSidebarOpen(false));
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && sidebar.classList.contains("show")) {
			setSidebarOpen(false);
			menuToggle.focus();
		}
	});
	window
		.matchMedia("(max-width: 992px)")
		.addEventListener("change", () => setSidebarOpen(false));

	document
		.querySelectorAll('.sidebar-link[href^="#"], .quick-action-item')
		.forEach((link) => {
			link.addEventListener("click", (event) => {
				event.preventDefault();
				setSidebarOpen(false);
				const action = link.textContent.trim();
				window.alert(
					`${action} is a planned module and is not connected in this static demo yet.`,
				);
			});
		});

	document.getElementById("notificationBtn").addEventListener("click", () => {
		const notices = Array.from(
			document.querySelectorAll(".announcement-item"),
			(item) => {
				const title = item
					.querySelector(".announcement-title")
					.textContent.trim();
				const date = item
					.querySelector(".announcement-date")
					.textContent.trim();
				return `${title} (${date})`;
			},
		);
		window.alert(
			`Campus administrative notices:\n\n${notices.join("\n\n")}`,
		);
		const badge = document.querySelector(".notification-badge");
		if (badge) badge.remove();
		document
			.getElementById("notificationBtn")
			.setAttribute("aria-label", "View notifications (all read)");
	});

	const rows = Array.from(
		document.querySelectorAll("#studentRegistrations tbody tr"),
	);
	const search = document.getElementById("recordSearch");
	const count = document.getElementById("registrationCount");
	const emptyMessage = document.getElementById("noSearchResults");

	search.addEventListener("input", () => {
		const query = search.value.trim().toLowerCase();
		let visibleCount = 0;
		rows.forEach((row) => {
			const record = Array.from(row.cells)
				.slice(0, 5)
				.map((cell) => cell.textContent)
				.join(" ");
			row.hidden = !record.toLowerCase().includes(query);
			if (!row.hidden) visibleCount += 1;
		});
		count.textContent = `${visibleCount} of ${rows.length} Entries`;
		emptyMessage.hidden = visibleCount !== 0;
	});

	rows.forEach((row) => {
		row.querySelector("button").addEventListener("click", () => {
			const details = [
				`Registration ID: ${row.cells[0].textContent.trim()}`,
				`Student: ${row.cells[1].querySelector(".font-semibold").textContent.trim()}`,
				`Email: ${row.cells[1].querySelector(".text-muted").textContent.trim()}`,
				`Department: ${row.cells[2].textContent.trim()}`,
				`Semester: ${row.cells[3].textContent.trim()}`,
				`Status: ${row.cells[4].textContent.trim()}`,
			];
			window.alert(details.join("\n"));
		});
	});
})();
