var pubnub = PUBNUB.init({
    publish_key: 'pub-c-3b1a90da-b8c6-4753-a965-7fd056636e55',
    subscribe_key: 'sub-c-9fd7a810-f093-11ea-92d8-06a89e77181a'
  });

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
  
  var Chatroom = function(direction) {
    //varible to tell whether character moved this call
    let moved = false;
  
    // give this chatroom the correct id
    if (direction === "start") {
      locationIndex = "North-Woods-Entrance";
    } else if (!(locations[locationIndex][direction] === "none")) {
      //set locationIndex to next locations
      locationIndex = locations[locationIndex][direction];
      moved = true;

    }
    var id = locationIndex;
  
    // use the id as the PubNub channel
    var channel = 'oo-chat-' + id;
    $(".panel-heading").text(`${id}`);

    // define our jQuery template object
    var $tpl = $(".panel");
  
    // store jQuery selectors
    var $form = $tpl.find('form');
    var $input = $form.find('.chat-input');
    var $output = $tpl.find('.chat-output');
  
    // this function draws the chatroom on the page and binds the DOM elements
    var render = function() {
  
      $form.submit(function() {
  
        pubnub.publish({
          channel: channel,
          message: $input.val()
        });
  
        $input.val('');
        
        return false;
  
      });
    };
  
    // this function is fired when Chatroom() is called
    var init = function() {
      pubnub.addListener({
        message: (message) => {
          // handle message
          const channelName = message.channel;
          const channelGroup = message.subscription;
          const publishTimetoken = message.timetoken;
          const msg = message.message;
          const publisher = message.publisher;
      
          //show time
          const unixTimestamp = message.timetoken / 10000000;
          const gmtDate = new Date(unixTimestamp * 1000);
          const localeDateTime = gmtDate.toLocaleString();
        }
      });
      
      pubnub.subscribe({
        channel: channel,    
        connect: render,
        message: function(text) {
  
            var $line = $('<div class="list-group-item"></div>');
            var $message = $('<span class="text" />').text(text).html();

            $line.append($message);
            $output.append($line);
            $output.scrollTop($output[0].scrollHeight);
  
        }
      });
  
    };
  
    init();

  if (moved) {
    pubnub.publish(
      {
        channel: channel,
        message: `You move ${direction}, to ${locationIndex}`,
      },
      function(status, response) {
        console.log(status);
        console.log(response);
      }
    );
  }
};

  $('.spawn-chatroom').click(function(){
    console.log(this.value);
    Chatroom(this.value);  
  });

  Chatroom("start");