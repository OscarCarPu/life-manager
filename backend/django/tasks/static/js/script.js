// htmx-modal-dialog handling
function htmxModalDialog() {
  const modalDialog = document.getElementById('htmx-modal-dialog');

  modalDialog.addEventListener('htmx:afterSwap', function(event) {
    if (event.detail.target.id === 'htmx-modal-dialog' && event.detail.xhr.status === 200) {
      modalDialog.style.display = 'block';
      modalDialog.showModal();
    }
  });

  modalDialog.addEventListener('close', function() {
    modalDialog.style.display = 'none';
    modalDialog.innerHTML = '';
  });

  document.body.addEventListener('closeModal', function() {
    modalDialog.close();
    modalDialog.style.display = 'none';
    modalDialog.innerHTML = '';
  });
}

htmxModalDialog();
