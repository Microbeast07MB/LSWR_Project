/* ==============================================================================
   EngLish Platform - Auth Guard
   Configured to allow public website browsing without mandatory login.
   Students can freely explore and practice LSRW modules, and log in whenever
   they wish to view or sync their personal Student Dashboard.
   ============================================================================== */

(function () {
    // Ensure pages are never hidden
    if (typeof document !== "undefined") {
        document.documentElement.classList.remove("auth-pending");
    }
})();
