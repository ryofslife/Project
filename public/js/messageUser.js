var msgNum = document.getElementById("msg").value;
console.log('number of users ' + msgNum)
for (let i = 0; i < msgNum; i++) {
  var value = document.getElementById(`msgBtn${i}`).value;
  var userName = value;
  var userNames = value.split(" ");
  var mainUser = userNames[0];
  var listedUser = "";
  if (mainUser != userNames[1]) {
    listedUser = userNames[1]
  } else {
    listedUser = userNames[2]
  }
  document.getElementById(`msgBtn${i}`).prepend(listedUser + '\xa0\xa0')
  document.getElementById(`message${userNames[1]}${userNames[2]}`).placeholder=`Type a message to ${listedUser}`;
}
