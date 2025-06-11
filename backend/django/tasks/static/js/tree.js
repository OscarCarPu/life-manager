document.addEventListener('DOMContentLoaded', function() {
    const categoryContainers = document.querySelectorAll('.col-custom');

    function calculateContentWeight(containerElement) {
        const projectsCount = parseInt(containerElement.dataset.projectsCount || 0);
        const subcategoriesCount = parseInt(containerElement.dataset.subcategoriesCount || 0);

        let weight = 0;

        weight += 1;

        weight += projectsCount * 0.5;
        weight += subcategoriesCount * 2.5;

        return weight;
    }

    function getColumnClasses(weight, isRoot) {
        let classes = [];

        classes.push('col-12');

        if (isRoot) {
            if (weight >= 8) {
                classes.push('col-md-8', 'col-lg-6', 'col-xl-4');
            } else if (weight >= 4) {
                classes.push('col-md-6', 'col-lg-4', 'col-xl-3');
            } else {
                classes.push('col-md-4', 'col-lg-3', 'col-xl-2');
            }
        } else {

            if (weight >= 5) {
                classes.push('col-sm-6', 'col-md-6', 'col-lg-6');
            } else if (weight >= 2) {
                classes.push('col-sm-6', 'col-md-4', 'col-lg-4');
            } else {
                classes.push('col-sm-4', 'col-md-3', 'col-lg-3');
            }
        }
        return classes;
    }

    function applyDynamicSizing() {
        categoryContainers.forEach(container => {
            const card = container.querySelector('.category-card');
            if (!card) return;
            const isRoot = container.closest('.row').classList.contains('g-4');

            const contentWeight = calculateContentWeight(container);
            const newClasses = getColumnClasses(contentWeight, isRoot);

            container.classList.forEach(cls => {
                if (cls.startsWith('col-')) {
                    container.classList.remove(cls);
                }
            });
            container.classList.add(...newClasses);
        });
    }

    applyDynamicSizing();

    // Optional: Recalculate on window resize to ensure responsiveness for fluid layouts.
    // This can be performance-intensive for very large trees, consider debouncing.
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('Window resized, re-applying dynamic column sizing.');
            applyDynamicSizing();
        }, 200); // Debounce for 200ms
    });
});
