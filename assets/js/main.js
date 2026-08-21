document.querySelectorAll(".sidebar-toggle").forEach(button => {

    button.addEventListener("click", () => {

        const section = button.closest(".sidebar-section");

        section.classList.toggle("open");

    });

});