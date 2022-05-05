var dropdownMenu = document.getElementById("dropdownMenu");

function dropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}

dropdownMenu.addEventListener('click',
  function() {
      dropdown();
  }
);

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  console.log(event.target)
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
