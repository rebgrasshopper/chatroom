//GOALS:
  //allow user to stay scrolled up if they scroll, but pin to the bottom again if they scroll down.
  //set up user accounts
  //set up command line interactions

const pubnub = new PubNub({
  publishKey: 'pub-c-3b1a90da-b8c6-4753-a965-7fd056636e55',
  subscribeKey: 'sub-c-9fd7a810-f093-11ea-92d8-06a89e77181a',
  uuid: "Rellwoos"
});

let channel;
let locationIndex = "North-Woods-Entrance";
const shortDirections = {n:"north", s:"south", e:"east", w:"west"};
//Game data is accessed with the variable woodsWalk



displayMessage = function(messageType, aMessage) {
  console.log(aMessage);
  $("#anchor").before(`<p class="displayed-message">${aMessage.publisher}: ${aMessage.message.text}</p>`);
  updateScroll();
}

pubnub.addListener({
  message: (message) => {
    displayMessage('[MESSAGE: received]', message);

    const channelName = message.channel;
    const channelGroup = message.subscription;
    const publishTimetoken = message.timetoken;
    const msg = message.message;
    const publisher = message.publisher;
    const unixTimestamp = message.timetoken / 10000000;
    const gmtDate = new Date(unixTimestamp * 1000);
    const localeDateTime = gmtDate.toLocaleString();
  },

  status: (status) => {
    const affectedChannels = status.affectedChannels;
    const category = status.category;
    const operation = status.operation;
  },

  presence: (presence) => {
    const action = presence.action;
    const channelName = presence.channel;
    const uuid = presence.uuid;
  },
});//end addListener





//MOVE TO A NEW ROOM, AND GET A NEW CHAT
const Chatroom = function(direction) {

  // give this chatroom the correct id
  if (direction === "start") {
    locationIndex = "North-Woods-Entrance";
    $("#anchor").before(`<p class="displayed-message" style="color:rgb(249, 255, 199)">In: ${locationIndex.replace(/ /g, " ")}</p>`);
    $("#anchor").before(`<p class="displayed-description">${woodsWalk[locationIndex].descriptions["light"]}</p>`);
    updateScroll();
  } else if (!(woodsWalk[locationIndex].exits[direction] === "none")) {
    //unsubscribe from previous room
    //set locationIndex to next location
    locationIndex = woodsWalk[locationIndex].exits[direction];
    $("#anchor").before(`<p class="displayed-message">${pubnub.getUUID()} moved ${shortDirections[direction]}</p>`);
    $("#anchor").before(`<p class="displayed-message" style="color:rgb(249, 255, 199)">In: ${locationIndex.replace(/ /g, " ")}</p>`);
    $("#anchor").before(`<p class="displayed-description">${woodsWalk[locationIndex].descriptions["light"]}</p>`);
    updateScroll();

  }

  // set channel off of locationIndex channel
  const id = locationIndex;
  channel = 'oo-chat-' + id;
  $(".panel-heading").text(`${id}`);

  // this function is fired when Chatroom() is called
  const init = function() {

    pubnub.unsubscribeAll();
    console.log("subscribing");
    pubnub.subscribe({channels: [channel]});

  };//end init

  init();

};
//USER BUTTONS TO MOVE UNTIL COMMAND LINE FUNCTIONS
$('.spawn-chatroom').click(function(){
  console.log(this.value);
  Chatroom(this.value);  
});

//INITIALIZE PAGE
Chatroom("start");


function publishMessage(value){
  pubnub.publish({
    channel: channel,
    message: {"text":value},
    },

    function(status, response) {
      console.log("Publishing from submit button event");
      if (status.error) {
        console.log(status);
        console.log(response);
      }
    }
  );
}



//submit behavior
$("#submit-button").click(function(event) {
  event.preventDefault();

  //log, then clear input value
  let value = $(".chat-input").val();
  console.log(value);
  $(".chat-input").val("");

  //accept look (look or l)
  if (value.toLowerCase().startsWith("l ") || (value.toLowerCase().startsWith("l") && value.length === 1) || value.toLowerCase().startsWith("look ") || (value.toLowerCase().startsWith("look") && value.length === 4)){
    $("#anchor").before(`<p class="displayed-message" style="color:rgb(249, 255, 199)">You look around you.</p>`);
    $("#anchor").before(`<p class="displayed-description">${woodsWalk[locationIndex].descriptions["light"]}</p>`);
    updateScroll();

    //making slicer for speaking cues
  } else if (value.startsWith("\"") || value.startsWith("\'") || value.toLowerCase().startsWith("say ")){
    let startsWithQuotes = false;
    if (value.toLowerCase().startsWith("say ")) {
      value = value.slice(4);
    }
    if (value.startsWith("\"") || value.startsWith("\'")) {
      value = value.slice(1);
      startsWithQuotes = true;
    }
    if ((value.endsWith("\"") || value.endsWith("\'")) && (startsWithQuotes)) {
      value = value.slice(0,-1);
      startsWithQuotes = false;
    }
    
    publishMessage(value);
  }


})



//Srolling

function updateScroll(){
  console.log("calling scroll updater");
  $(".message-output-box").scrollTop($(".message-output-box")[0].scrollHeight)  
}