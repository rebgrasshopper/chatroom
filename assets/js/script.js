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
    $("#anchor").before(`<p class="displayed-description">${woodsWalk.location[locationIndex].descriptions["light"]}</p>`);
    updateScroll();
  } else if (!(woodsWalk.location[locationIndex].exits[direction] === "none") && !(woodsWalk.location[locationIndex].exits[direction] === undefined)) {
    //unsubscribe from previous room
    //set locationIndex to next location
    locationIndex = woodsWalk.location[locationIndex].exits[direction];
    $("#anchor").before(`<p class="displayed-message">You moved ${shortDirections[direction]}</p>`);
    $("#anchor").before(`<p class="displayed-message" style="color:rgb(249, 255, 199)">In: ${locationIndex.replace(/ /g, " ")}</p>`);
    $("#anchor").before(`<p class="displayed-description">${woodsWalk.location[locationIndex].descriptions["light"]}</p>`);
    updateScroll();

  } else {
    logThis("There's no exit at " + direction);
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
// //USER BUTTONS TO MOVE UNTIL COMMAND LINE FUNCTIONS
// $('.spawn-chatroom').click(function(){
//   console.log(this.value);
//   Chatroom(this.value);  
// });

//INITIALIZE PAGE
Chatroom("start");



















//INPUT SUBMIT BEHAVIOR
$("#submit-button").click(function(event) {
  event.preventDefault();

  //log, then clear input value
  let value = $(".chat-input").val();
  console.log(value);
  $(".chat-input").val("");

  //accept look (look or l)
  if (value.toLowerCase().startsWith("l ") || (value.toLowerCase().startsWith("l") && value.length === 1) || value.toLowerCase().startsWith("look ") || (value.toLowerCase().startsWith("look") && value.length === 4)){
    
    //display room location and description
    $("#anchor").before(`<p class="displayed-message" style="color:rgb(249, 255, 199)">You look around you.</p>`);
    describeThis(woodsWalk.location[locationIndex].descriptions["light"])
    
    //add interactable items
    if (Object.keys(woodsWalk.location[locationIndex].items).length > 0){
      let objectString = "";
      for (let item in woodsWalk.location[locationIndex].items){
        if (woodsWalk.location[locationIndex].items[item] === "here") {
          objectString += "a " + item + ", ";
        }
      }
      objectString = objectString.slice(0,-2);
      objectString += ".";
      describeThis(`You also see: ${objectString}`)
    }
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
    //accept picking up itmes and adding them to inventory
  } else if (doesThisStartWithThat(value, interactionWords.get)) {
    console.log("Getting something");
    value = takeTheseOffThat(interactionWords.get, value);
    value = takeTheseOffThat(["a ", "the "], value);
    console.log(value);
    if (Object.keys(woodsWalk.location[locationIndex].items).includes(value)){
      console.log(value + " is in the room!");
      logThis(`You pick up the ${value}.`)
      woodsWalk.character.inventory.push(value);
    } else {
      value = takeTheseOffThat(interactionWords.get, value);
      value = takeTheseOffThat(["a ", "the "], value);
      logThis(`There doesn't seem to be a ${value} around here.`);
    }
    //accept looking at inventory
  } else if (value.startsWith("i ") || ((value.startsWith("i")) && (value.length === 1)) || value.startsWith('inventory')) {
    logThis(woodsWalk.character.inventory);
    //accept cardinal directions for movement
  } else if (doesThisEqualThat(value, movementWords.directions) || doesThisStartWithThat(value, movementWords.move)) {
    if (doesThisEqualThat(value, movementWords.directions)){
      value = parseAlternateWords(value, directions)
      Chatroom(value);
    } else {
      value = takeTheseOffThat(movementWords.move, value);
      value = parseAlternateWords(value, directions);
      Chatroom(value);
    }
  }


})








//helper functions

//determine if a string begins with any of an array of other strings
function doesThisStartWithThat(thisThing, that) {
  for (let thing of that) {
    if (thisThing.toLowerCase().startsWith(thing)) {
      return true
    }
  }
  return false
}

//slice off any string from an array that is found at the beginning of another string
function takeTheseOffThat(these, that) {
  for (let thing of these) {
    if (that.toLowerCase().startsWith(thing)) {
      return that.slice(thing.length).trim();
    }
  }

  return that;
}

//see if a string is equal to any of the strings in an array
function doesThisEqualThat(thisThing, that) {
  for (let thing of that) {
    if (thisThing.toLowerCase().trim() === thing) {
      return true;
    }
  }
  return false;
}

//return alias for words with multiple ways to type them
function parseAlternateWords(thisThing, objecty) {
  for (let thing in objecty) {
    if (thisThing.toLowerCase().trim() === objecty[thing]) {
      return thing;
    }
  }
  console.log("it wasn't in there")
  return thisThing;
}

function logThis(text) {
  $("#anchor").before(`<p class="displayed-message">${text}</p>`);
}

function describeThis(text) {
  $("#anchor").before(`<p class="displayed-description">${text}</p>`);
}




//mid-level functions

//publish text to pubnub server as a message
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

//Srolling
function updateScroll(){
  console.log("calling scroll updater");
  $(".message-output-box").scrollTop($(".message-output-box")[0].scrollHeight)  
}