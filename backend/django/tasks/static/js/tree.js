document.addEventListener('DOMContentLoaded', function() {
  // Apply color contrast to project links and dropdown button only on hover
  function setupProjectLinkContrast() {
    const projectLinks = document.querySelectorAll('.project-link');

    projectLinks.forEach(element => {
      const backgroundColor = getComputedStyle(element).getPropertyValue('--project-color').trim();
      ColorContrast.applyContrastClass(element, backgroundColor, true);
    });

    const dropdownCategory = document.querySelectorAll('.category-actions-dropdown');

    dropdownCategory.forEach(element => {
      const backgroundColor = getComputedStyle(element).getPropertyValue('--project-color').trim();
      ColorContrast.applyContrastClass(element, backgroundColor, true);
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
  setupProjectLinkContrast();
  adjustDescriptionWidth();

  // Re-apply after HTMX swaps
  document.body.addEventListener('htmx:afterSwap', function(event) {
    if (event.target.id === 'category-tree-container' || event.target.closest('#category-tree-container')) {
      setupProjectLinkContrast();
      adjustDescriptionWidth();
    }
  });
});
