const pubnub = new PubNub({
  publishKey: 'pub-c-3b1a90da-b8c6-4753-a965-7fd056636e55',
  subscribeKey: 'sub-c-9fd7a810-f093-11ea-92d8-06a89e77181a',
  uuid: "Rellwoos"
});

let channel;
let locations = {
  "North-Woods-Entrance":
  {n:"North-Woods-Path-A", s:"Plains-X", w:"none", e:"none"},
  "North-Woods-Path-A":
  {n:"North-Woods-Path-B", s:"North-Woods-Entrance", w:"none", e:"none"},
  "North-Woods-Path-B":
  {n:"Empty-Grotto", s:"North-Woods-Path-A", w:"none", e:"none"},
  "Empty-Grotto":
  {n:"none", s:"North-Woods-Path-B", w:"none", e:"none"},
  "Plains-X":
  {n:"North-Woods-Entrance", s:"none", w:"none", e:"none"}
};
let emptyDirections = {n:"", s:"", w:"", e:""};
let locationIndex = "North-Woods-Entrance";




displayMessage = function(messageType, aMessage) {
  console.log(aMessage);
  $(".chat-output").append(`<p class="displayed-message">${aMessage.publisher}: ${aMessage.message.text}</p>`);
}









const Chatroom = function(direction) {
  //varible to tell whether character moved this call
  let moved = false;

  // give this chatroom the correct id
  if (direction === "start") {
    locationIndex = "North-Woods-Entrance";
  } else if (!(locations[locationIndex][direction] === "none")) {
    //unsubscribe from previous room
    pubnub.unsubscribe({channels: [channel]})
    //set locationIndex to next locations
    locationIndex = locations[locationIndex][direction];
    moved = true;

  }
  const id = locationIndex;

  // use the id as the PubNub channel
  channel = 'oo-chat-' + id;
  $(".panel-heading").text(`${id}`);

  // this function is fired when Chatroom() is called
  const init = function() {

    //message listener
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
    });

    pubnub.subscribe({channels: [channel]});

  };

  init();

  if (moved) {
    pubnub.publish(
      {
        channel: channel,
        message: {"text":`You move ${direction}, to ${locationIndex}`},
      },
      function(status, response) {
        // console.log(status);
        console.log(response);
      }
    );
  }

  //publish message on submit
  $("#submit-button").click(function(event) {
    event.preventDefault();

    //log, then clear input value
    let value = $(".chat-input").val();
    console.log(value);
    $(".chat-input").val("");

    pubnub.publish(
      {
        channel: channel,
        message: {"text":value},
      },
      function(status, response) {
        // console.log(status);
        console.log(response);
      }
    );
  })


};

  $('.spawn-chatroom').click(function(){
    console.log(this.value);
    Chatroom(this.value);  
  });

  Chatroom("start");

