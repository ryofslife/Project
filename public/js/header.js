var dropdownMenu = document.getElementById("dropdownMenu");

function dropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}

dropdownMenu.addEventListener('click',
  function() {
      dropdown();
  }
);
