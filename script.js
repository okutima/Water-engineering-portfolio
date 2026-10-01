(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        /* =====================================================
           MOBILE NAVIGATION
           ===================================================== */
        var hamburger = document.getElementById("hamburger");
        var navLinks = document.getElementById("navLinks");

        function setMenu(open) {
            if (!hamburger || !navLinks) return;
            hamburger.setAttribute("aria-expanded", String(open));
            hamburger.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
            navLinks.classList.toggle("open", open);
        }

        if (hamburger && navLinks) {
            hamburger.addEventListener("click", function () {
                setMenu(hamburger.getAttribute("aria-expanded") !== "true");
            });

            navLinks.addEventListener("click", function (e) {
                if (e.target.closest("a")) setMenu(false);
            });

            document.addEventListener("click", function (e) {
                if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) setMenu(false);
            });

            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
                    setMenu(false);
                    hamburger.focus();
                }
            });

            // Close the drawer if the viewport grows to desktop width
            window.addEventListener("resize", function () {
                if (window.innerWidth > 900) setMenu(false);
            });
        }

        /* =====================================================
           EXPERIENCE ACCORDION
           ===================================================== */
        var triggers = Array.prototype.slice.call(document.querySelectorAll(".accordion-trigger"));

        function setPanel(trigger, open) {
            var panel = document.getElementById(trigger.getAttribute("aria-controls"));
            if (!panel) return;
            trigger.setAttribute("aria-expanded", String(open));
            panel.hidden = !open;
        }

        triggers.forEach(function (trigger, index) {
            trigger.addEventListener("click", function () {
                var open = trigger.getAttribute("aria-expanded") === "true";
                // Close siblings for a clean single-open accordion
                triggers.forEach(function (other) {
                    if (other !== trigger) setPanel(other, false);
                });
                setPanel(trigger, !open);
            });

            trigger.addEventListener("keydown", function (e) {
                var target = null;
                if (e.key === "ArrowDown") target = triggers[(index + 1) % triggers.length];
                else if (e.key === "ArrowUp") target = triggers[(index - 1 + triggers.length) % triggers.length];
                else if (e.key === "Home") target = triggers[0];
                else if (e.key === "End") target = triggers[triggers.length - 1];
                if (target) {
                    e.preventDefault();
                    target.focus();
                }
            });
        });

        function expandAllPanels() { triggers.forEach(function (t) { setPanel(t, true); }); }

        /* =====================================================
           SECTION ROUTING
           ===================================================== */
        var pages = Array.prototype.slice.call(document.querySelectorAll("section.page"));
        var allLinks = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));
        var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));

        function showPage(id) {
            if (!id || id === "#") id = "#home";

            var target = document.querySelector(id);
            var valid = target && pages.indexOf(target) !== -1;
            if (!valid) id = "#home";

            pages.forEach(function (page) { page.style.display = "none"; });
            var current = document.querySelector(id);
            if (current) current.style.display = "block";

            navItems.forEach(function (link) {
                var match = link.getAttribute("href") === id;
                link.classList.toggle("active", match);
                if (match) link.setAttribute("aria-current", "page");
                else link.removeAttribute("aria-current");
            });

            if (typeof history.replaceState === "function" && window.location.hash !== id) {
                history.replaceState(null, "", id);
            }
            window.scrollTo(0, 0);
        }

        allLinks.forEach(function (link) {
            link.addEventListener("click", function (e) {
                var target = link.getAttribute("href");
                if (!target || target.charAt(0) !== "#") return;
                e.preventDefault();
                showPage(target);
                if (history.pushState) history.pushState(null, "", target);
            });
        });

        window.addEventListener("popstate", function () {
            showPage(window.location.hash || "#home");
        });

        showPage(window.location.hash || "#home");

        /* =====================================================
           DOWNLOAD CV (browser print-to-PDF)
           ===================================================== */
        var cvButton = document.getElementById("downloadCv");
        if (cvButton) {
            cvButton.addEventListener("click", function () {
                expandAllPanels();
                var restore = window.onbeforeprint;
                window.addEventListener("afterprint", function handler() {
                    window.removeEventListener("afterprint", handler);
                    if (typeof restore === "function") restore();
                });
                window.print();
            });
        }

        window.addEventListener("beforeprint", expandAllPanels);

        /* =====================================================
           FOOTER YEAR
           ===================================================== */
        var year = document.getElementById("year");
        if (year) year.textContent = new Date().getFullYear();
    });
})();
