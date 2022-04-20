var hello = document.getElementsByClassName("btn btn-primary hellobutton");

var socket = io();

function dosomething(value){
  var userName = value;
  var userNames = value.split(" ");
  var mainUser = userNames[0];
  var listedUser = "";
  if (mainUser != userNames[1]) {
    listedUser = userNames[1]
  } else {
    listedUser = userNames[2]
  }
  var bothUserNames = `${userNames[1]}${userNames[2]}`;

$( `#messageBox${bothUserNames}` ).on('shown.bs.modal', function(){
    chatWindow = document.getElementById(`messages${bothUserNames}`);
    var xH = chatWindow.scrollHeight;
    chatWindow.scrollTo(0, xH);

    socket.connect()
});

$( `#messageBox${bothUserNames}` ).on('hide.bs.modal', function(){

    $(`#messages${bothUserNames}`).html("");

    socket.disconnect();
});

// getting messages
(function() {
  // getElementById does not require # in front of Id
  var msgs = document.getElementById(`messages${bothUserNames}`);

  $(`#messageForm${bothUserNames}`).submit(function(e) {
    let li = document.createElement("li");
    // e.preventDefault(); // prevents page reloading
    // $("#message").val() is the input
    // the line key 1 sends the input to the app.js and save it to the database, it won't be seen without the line key 2 unless the browser is reloaded
    if ($(`#message${bothUserNames}`).val() === "") {
      return
    } else {
      console.log($(`#message${bothUserNames}`).val())
      // socket.emit("chat message", $(`#message${bothUserNames}`).val()); // key 1
      // NEED TO SEND MAINUSER (SENDER) ALONG WITH THE MESSAGE
      // THE SENDER HERE IS ALWAYS THE MAINUSER
      socket.emit("chat message", { message: $(`#message${bothUserNames}`).val(), sender: mainUser }); // key 1
    }
    // the line key 2 shows the input instantly without save it to the database
    let g = document.createElement("article");
    // *DOES NOT REQURE TO KNOW WHO SENT THE MESSAGE AS THE SENDER IS ALWAYS THE MAINUSER
    g.className = 'msg-container msg-self';
    let h = document.createElement("div");
    h.className = 'msg-box';
    // h.setAttribute('class', 'msg-box');
    let i = document.createElement("div");
    i.className = 'flr';
    let j = document.createElement("div");
    j.className = 'messages';
    let k = document.createElement("p");
    k.className = 'msg';
    let l = document.createElement("span");
    l.className = 'username';
    // for nesting another tag inside the other
    var newBox = msgs.appendChild(g).appendChild(h).appendChild(i);
    newBox.appendChild(j).appendChild(k).append($(`#message${bothUserNames}`).val()); // key2
    // *DOES NOT REQURE TO KNOW WHO SENT THE MESSAGE AS THE SENDER IS ALWAYS THE MAINUSER
    newBox.appendChild(l).append("by " + `${mainUser}`);

    chatWindow = document.getElementById(`messages${bothUserNames}`);
    var xH = chatWindow.scrollHeight;
    chatWindow.scrollTo(0, xH);

    $(`#message${bothUserNames}`).val("");

    return false;

  });

  // receiving messages from others inside the same room
  socket.on("received", data => {
    var collection = document.getElementsByClassName(data.message);
    if (collection.length == 0) {
      let g = document.createElement("article");
      // THE SENDER HERE IS ALWAYS THE LISTEDUSER*
      g.className = 'msg-container msg-remote';
      let h = document.createElement("div");
      h.className = 'msg-box';
      let i = document.createElement("div");
      i.className = 'flr';
      let j = document.createElement("div");
      j.className = 'messages';
      let k = document.createElement("p");
      k.className = `${data.message} msg`;
      let l = document.createElement("span");
      l.className = 'username';
      // for nesting another tag inside the other
      var newBox = msgs.appendChild(g).appendChild(h).appendChild(i);
      newBox.appendChild(j).appendChild(k).append(data.message);
      // *DOES NOT REQURE TO KNOW WHO SENT THE MESSAGE AS THE SENDER IS ALWAYS THE LISTEDUSER
      newBox.appendChild(l).append("by " + `${listedUser}`);

      chatWindow = document.getElementById(`messages${bothUserNames}`);
      var xH = chatWindow.scrollHeight;
      chatWindow.scrollTo(0, xH);

      console.log("Message received!");
    }
  });
})();

// for saving the messages to database
(async function () {
  // need to pass the user ids during home.ejs is being loaded
  console.log('fetch request for ' + listedUser)
  const response = await fetch('/conversations/' + listedUser);

  (async function () {
    const data = await response.json();

    socket.emit('join', data._id, function (err) {
      if (err) {
        alert(err);
      } else {
        console.log(`No error joining the room ${data._id}`);
      }
    });

    // .map() iterates the objects
    data.messages.map(msg => {
    // NEED TO KNOW WHO THE SENDER IS BASED ON THE FETCHED FOR APPENDING MESSAGES INSIDE THE MESSAGE BOX, if (msg.sender == mainuser){}else{}
    var whoSent = ""
    var sender = ""
    if (msg.sender == mainUser) {
      whoSent = 'self';
      sender = mainUser;
    } else {
      whoSent = 'remote';
      sender = listedUser;
    }
    var msgs = document.getElementById(`messages${bothUserNames}`);
    let a = document.createElement("article");
    // NEED TO KNOW WHO THE SENDER IS BASED ON THE FETCHED FOR APPENDING MESSAGES INSIDE THE MESSAGE BOX, if (msg.sender == mainuser){}else{}
    a.className = `msg-container msg-${whoSent}`;
    let b = document.createElement("div");
    b.className = 'msg-box';
    let c = document.createElement("div");
    c.className = 'flr';
    let d = document.createElement("div");
    d.className = 'messages';
    let e = document.createElement("p");
    e.className = 'msg';
    let f = document.createElement("span");
    f.className = 'username';
    // for nesting another tag inside the other
    var outerBox = msgs.appendChild(a).appendChild(b).appendChild(c);
    outerBox.appendChild(d).appendChild(e).append(msg.message);
    // NEED TO KNOW WHO THE SENDER IS BASED ON THE FETCHED FOR APPENDING MESSAGES INSIDE THE MESSAGE BOX, if (msg.sender == mainuser){}else{}
    outerBox.appendChild(f).append("by " + `${sender}`);
    })
  })();
})();
}

for(var i = 0; i < hello.length; i++) {
  hello[i].addEventListener('click',
    function() {
        dosomething(event.target.value);
    }
  );
}
