/* =====================================================
   MOBILE MENU
===================================================== */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {

    mobileMenu.classList.toggle("open");

    const icon = menuBtn.querySelector("i");

    if (mobileMenu.classList.contains("open")) {

        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");

    } else {

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    }

});


/* Close mobile menu after clicking a link */

const mobileLinks =
    document.querySelectorAll(".mobile-menu a");

mobileLinks.forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("open");

        const icon = menuBtn.querySelector("i");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    });

});


/* =====================================================
   IELTS MODAL
===================================================== */

const testModal =
    document.getElementById("testModal");

const testBtn =
    document.getElementById("testBtn");

const ctaBtn =
    document.getElementById("ctaBtn");

const closeModal =
    document.getElementById("closeModal");

const modalStart =
    document.getElementById("modalStart");


function openModal() {

    testModal.classList.add("show");

    document.body.style.overflow = "hidden";

}


function closeTestModal() {

    testModal.classList.remove("show");

    document.body.style.overflow = "";

}


testBtn.addEventListener("click", openModal);

ctaBtn.addEventListener("click", openModal);

closeModal.addEventListener("click", closeTestModal);


/* Close when clicking outside */

testModal.addEventListener("click", (event) => {

    if (event.target === testModal) {

        closeTestModal();

    }

});


/* ESC key */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeTestModal();

    }

});


/* =====================================================
   START TEST
===================================================== */

modalStart.addEventListener("click", () => {

    window.location.href = "listening.html";

});


/* =====================================================
   SMOOTH SCROLL
===================================================== */

document.querySelectorAll('a[href^="#"]')
    .forEach(anchor => {

        anchor.addEventListener("click", function(event) {

            const targetId =
                this.getAttribute("href");

            if (targetId === "#") {

                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                return;

            }

            const target =
                document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


/* =====================================================
   NAVBAR ACTIVE LINK
===================================================== */

const sections =
    document.querySelectorAll("section[id]");

const navLinks =
    document.querySelectorAll(".nav-links a");


window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 120;

        const sectionHeight =
            section.clientHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {

            current = section.getAttribute("id");

        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + current
        ) {

            link.classList.add("active");

        }

    });

});


/* =====================================================
   SCROLL REVEAL ANIMATION
===================================================== */

const animatedElements =
    document.querySelectorAll(
        ".skill-card, .feature, .engineering-content, .engineering-visual"
    );


const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );


animatedElements.forEach(element => {

    observer.observe(element);

});


/* =====================================================
   HERO BUTTON RIPPLE EFFECT
===================================================== */

const buttons =
    document.querySelectorAll(
        ".primary-btn, .secondary-btn, .white-btn, .cta-btn"
    );


buttons.forEach(button => {

    button.addEventListener("click", function() {

        this.style.transform = "scale(0.98)";

        setTimeout(() => {

            this.style.transform = "";

        }, 120);

    });

});