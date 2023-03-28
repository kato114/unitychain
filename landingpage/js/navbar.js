const navbar = document.querySelector('.navbar');


window.onscroll = () => {
    navbarFunction();
};

function navbarFunction() {

    if (window.scrollY > 0) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}
$(document).ready(function () {
    navbarFunction();
});