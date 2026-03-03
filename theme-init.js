(() => {
  "use strict";
  try {
    const stored = localStorage.getItem("theme");
    const theme = stored === "light" || stored === "dark" ? stored : null;
    if (theme) document.documentElement.setAttribute("data-theme", theme);
  } catch {
    // ignore
  }
})();
