document.addEventListener('DOMContentLoaded', function() {
  // Apply color contrast to project links and dropdown button
  function applyProjectLinkContrast() {
    const projectLinks = document.querySelectorAll('.project-link');

    ColorContrast.applyOptimalTextColor(projectLinks, {
      backgroundProperty: '--project-color',
      whiteTextClass: 'text-white-on-hover',
      darkTextClass: 'text-dark-on-hover',
      whiteColor: '#ffffff',
      darkColor: '#343a40'
    });

    const dropdownCategory = document.querySelectorAll('.category-actions-dropdown');

    ColorContrast.applyOptimalTextColor(dropdownCategory, {
      backgroundProperty: '--project-color',
      whiteTextClass: 'text-white-on-hover',
      darkTextClass: 'text-dark-on-hover',
      whiteColor: '#ffffff',
      darkColor: '#343a40'
    });
  }

  // Initialize color contrast
  applyProjectLinkContrast();

  // Re-apply color contrast after HTMX swaps
  document.body.addEventListener('htmx:afterSwap', function(event) {
    if (event.target.id === 'category-tree-container') {
      applyProjectLinkContrast();
    }
  });
});
