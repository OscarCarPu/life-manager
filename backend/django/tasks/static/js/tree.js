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

  function adjustDescriptionWidth() {
    document.querySelectorAll('.category-description').forEach(desc => {
      const card = desc.closest('.category-card');
      if (card) {
        const cardStyle = window.getComputedStyle(card);
        const paddingLeft = parseFloat(cardStyle.paddingLeft);
        const paddingRight = parseFloat(cardStyle.paddingRight);
        const contentWidth = card.clientWidth - paddingLeft - paddingRight;
        desc.style.maxWidth = contentWidth + 'px';
      }
    });
  }

  // Initialize
  applyProjectLinkContrast();
  adjustDescriptionWidth();

  // Re-apply after HTMX swaps
  document.body.addEventListener('htmx:afterSwap', function(event) {
    if (event.target.id === 'category-tree-container' || event.target.closest('#category-tree-container')) {
      applyProjectLinkContrast();
      adjustDescriptionWidth();
    }
  });
});
