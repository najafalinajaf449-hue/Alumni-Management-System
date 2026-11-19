// Client-side helpers: Bootstrap form validation, password match, photo preview
(() => {
    document.querySelectorAll(".needs-validation").forEach((form) => {
        form.addEventListener("submit", (e) => {
            const pw = form.querySelector("#password");
            const confirm = form.querySelector("#confirm_password");
            if (pw && confirm) {
                confirm.setCustomValidity(pw.value !== confirm.value ? "Passwords do not match" : "");
            }
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add("was-validated");
        });
    });

    const photo = document.getElementById("profile_photo");
    const preview = document.getElementById("photoPreview");
    if (photo && preview) {
        photo.addEventListener("change", () => {
            const file = photo.files[0];
            if (file) preview.src = URL.createObjectURL(file);
        });
    }
})();
