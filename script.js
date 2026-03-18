document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal animation with IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Triggers when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            } else {
                // Removing this allows the animation to repeat on scroll up
                // If you want it only once, leave the line above uncommented and remove this else block
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right, .fade-up');
    hiddenElements.forEach((el) => {
        observer.observe(el);
    });

    // Navbar transparency effect on scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(5, 5, 5, 0.95)';
            nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
            nav.style.padding = '15px 50px';
        } else {
            nav.style.background = 'rgba(5, 5, 5, 0.8)';
            nav.style.boxShadow = 'none';
            nav.style.padding = '20px 50px';
        }
    });
});
