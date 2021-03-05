function searchList() {

    var input, filter, currencyList, li, span, i, txtValue;
    input = document.getElementById('searchCurrency');
    filter = input.value.toUpperCase();
    currencyList = document.getElementById("currencyList");
    li = currencyList.getElementsByTagName('li');
  

    for (i = 0; i < li.length; i++) {
      span = li[i].getElementsByTagName("span")[0];
      txtValue = span.textContent || span.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }