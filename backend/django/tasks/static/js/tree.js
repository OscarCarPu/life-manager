document.addEventListener('DOMContentLoaded', function() {
    const categoryContainers = document.querySelectorAll('.col-custom');

    function calculateContentWeight(containerElement) {
    }

    function getColumnClasses(weight, isRoot) {
    }

    function applyDynamicSizing() {
    }

    // Apply color contrast to project links
    function applyProjectLinkContrast() {
        const projectLinks = document.querySelectorAll('.project-link');

        ColorContrast.applyOptimalTextColor(projectLinks, {
            backgroundProperty: '--project-color',
            whiteTextClass: 'text-white-on-hover',
            darkTextClass: 'text-dark-on-hover',
            whiteColor: '#ffffff',
            darkColor: '#343a40'
        });
    }

    // Initialize color contrast
    applyProjectLinkContrast();
});
