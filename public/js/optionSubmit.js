var selectForm = document.getElementById("sortByHashtag")

selectForm.addEventListener('change',
  function() {
    this.form.submit(); // form submission
  }
);
