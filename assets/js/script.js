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
let locations = {
  "North-Woods-Entrance": {exits:
  {n:"North-Woods-Path-A", s:"Plains-X", w:"none", e:"none"},
  descriptions:{light:"The path into the woods is well lit by sun from the plains to the south. Large redwoods and a variety of other trees competing for the leftover scraps of sunlight seem to stretch infinitely to either side, but the path to the north is clear. It's almost as if a diving line exists that keeps the plains on one side and the forest on the other.", dark:"You can just make out the way forward between the dense growth of trees with the faint glow of moonlight filtering dimly into the forest entrance."},
  },
  "North-Woods-Path-A":{exits:
  {n:"North-Woods-Path-B", s:"North-Woods-Entrance", w:"none", e:"none"},
  descriptions:{light:"The interior of the forest is shady, but well lit with dappled sunshine falling through the canopy. Birds call out to each other, unseen in the high tree-tops. You see the path stretching north before you.", dark:"It's almost pitch-black inside the wood, but you can just make out the path in front of you. The forest rustles around you in the night breeze, and the soft call of an owl floats in from far away."},
  },
  "North-Woods-Path-B":{exits:
  {n:"Empty-Grotto", s:"North-Woods-Path-A", w:"none", e:"none"},
  descriptions:{light:"The interior of the forest is shady, but well lit with dappled sunshine falling through the canopy. Birds call out to each other, unseen in the high tree-tops. North of you, you can see a brighter patch of light.", dark:"It's almost pitch-black inside the wood, but you can just make out the path in front of you. There seems to be a patch of moonlight to the north. Do the night noises of the forest seem quieter here?"},
  },
  "Empty-Grotto":{exits:
  {n:"none", s:"North-Woods-Path-B", w:"none", e:"none"},
  descriptions:{light:"Sunlight streams down in this small clearing. The trees tower around the edges, but this roughly circular patch of land is oddly clear of even the smallest sapling. Instead, vines, grasses, and flowers cover the ground here. You hear the raucus chatter of crows, and the swish of the leaves as the breeze dips into the clearing from above.", dark:"The small clearing is dim but clear to your night-adjusted eyes, with moonlight streaming down from the break in the canopy. The rustling leaves and the sound of a few crickets are the only things you hear here."},
  },
  "Plains-X":{exits:
  {n:"North-Woods-Entrance", s:"none", w:"none", e:"none"},
  descriptions:{light:"To the east, south, and west, stretch the open plains. Sunlight streams down on the tall grasses and small bushes that populate the plains. To the north, a grand forest stands, full of great redwoods and a smattering of other conifers and deciduous trees. The undergrowth seems impassibly dense, except for the path leading north from this spot.", dark:"Around you to the east, south, and west, the moon and stars shine down on the open, windy plains, lighting the grasses and small shrubs in a grayscale symphony of motion. The forest ahead is an imposing wall of darkness, and you can just make out the trail leading in to the north."},
  },
};
let emptyDirections = {n:"", s:"", w:"", e:""};
let locationIndex = "North-Woods-Entrance";
const shortDirections = {n:"north", s:"south", e:"east", w:"west"};



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
    $("#anchor").before(`<p class="displayed-description">${locations[locationIndex].descriptions["light"]}</p>`);
    updateScroll();
  } else if (!(locations[locationIndex].exits[direction] === "none")) {
    //unsubscribe from previous room
    //set locationIndex to next locations
    locationIndex = locations[locationIndex].exits[direction];
    $("#anchor").before(`<p class="displayed-message">${pubnub.getUUID()} moved ${shortDirections[direction]}</p>`);
    $("#anchor").before(`<p class="displayed-message" style="color:rgb(249, 255, 199)">In: ${locationIndex.replace(/ /g, " ")}</p>`);
    $("#anchor").before(`<p class="displayed-description">${locations[locationIndex].descriptions["light"]}</p>`);
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
    $("#anchor").before(`<p class="displayed-message" style="color:rgb(249, 255, 199)">In: ${locationIndex.replace(/ /g, " ")}</p>`);
    $("#anchor").before(`<p class="displayed-description">${locations[locationIndex].descriptions["light"]}</p>`);
    updateScroll();

    //making slicer for speaking cues
  } else if (value.startsWith("\"") || value.startsWith("\'") || value.toLowerCase().startsWith("say ")){
    if (value.startsWith("\"") || value.startsWith("\'")) {
      value = value.slice(1);
    }
    if (value.endsWith("\"") || value.endsWith("\'")) {
      value = value.slice(0,-1);
    }
    
    publishMessage(value);
  }


})



//Srolling

function updateScroll(){
  console.log("calling scroll updater");
  $(".message-output-box").scrollTop($(".message-output-box")[0].scrollHeight)  
}