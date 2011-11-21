var socket, nick;
 
var STATE = {
    entryfocused: true,
    logfocused: false,
    prevTime: '',
    prevNick: '',
    msgs: [],
    msgs_txt: ''
};

function init(){
  socket = io.connect("http://localhost", {port: 8080, transports: ["websocket"]});
  setEventHandlers();
  
}

var setEventHandlers = function() {
	// Keyboard
	//window.addEventListener("keydown", onKeydown, false);
	//window.addEventListener("keyup", onKeyup, false);

	// Window resize
	//window.addEventListener("resize", onResize, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	//socket.on("new player", onNewPlayer);

	// Player move message received
	//socket.on("move player", onMovePlayer);
  	socket.on("message", onMessageRecieved);

	// Player removed message received
	//socket.on("remove player", onRemovePlayer);
};

function onMessageRecieved(message){
    var data=JSON.parse(message);
    console.log("Message from: " + data.nick + ". Message was: " + data.message);
    addMessage(data.nick, data.message);
};

function onSocketConnected() {
	console.log("Connected to socket server");

	// Send local player data to the game server
	//socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};
function signin() {
    //lock the UI while waiting for a response
    showLoad();
    nick = $("#nickInput").attr("value");

    //dont bother the backend if we fail easy validations
    if (nick.length < 3) {
        alert("Nick too short. 3 characters minimum.");
        showConnect();
        return false;
    }

    if (nick.length > 20) {
        alert("Nick too long. 20 character max.");
        showConnect();
        return false;
    }

    //more validations
    if (/[^\w_\-^!]/.exec(nick)) {
        alert("Bad character in nick. Can only have letters, numbers, and '_', '-', '^', '!'");
        showConnect();
        return false;
    }
/*
    //make the actual join request to the server
    $.ajax({ cache: false
           , type: "GET" // XXX should be POST
           , dataType: "json"
           , url: CONFIG.node_url + "/join?jp=?"
           , data: { nick: nick , room: CONFIG.room}
           , error: function (session) {
               alert("error " + session.error);
               showConnect();
             }
           , success: onConnect
           });
    return false;*/
    //TODO Connect
    showChat();
}

function resizeLog() {
    var newHeight = $(window).height() - (45 + 26);//100;
    $('#logwrap').css('height',newHeight + "px");
    $('#entry').css('width', ($(window).width() - 30) + "px");
}

//Transition the page to the state that prompts the user for a nickname
function showConnect () {
    $("#connect").show();
    $("#loading").hide();
    $("#toolbar").hide();
    $("#logwrap").hide();
    $("#nickInput").focus();
    
}

//transition the page to the loading screen
function showLoad () {
    $("#connect").hide();
    $("#loading").show();
    $("#toolbar").hide();
    init();
}

//transition the page to the main chat view, putting the cursor in the textfield
function showChat (nick) {
    $("#toolbar").show();
    $("#entry").focus();
    $("#connect").hide();
    $("#loading").hide();
    $('#logwrap').show();
    scrollDown();
}

function send(msg) {
    	console.log("sending: " + msg);
	socket.emit("message", {nick: nick, message: msg});
}

util = {

isBlank: function(text) {
        var blank = /^\s*$/;
        return (text.match(blank) !== null);
    },
    zeroPad: function (digits, n) {
        n = n.toString();
        while (n.length < digits) 
          n = '0' + n;
        return n;
    },
    timeString: function (date) {
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
    },
    toStaticHTML: function(inputHtml) {
        inputHtml = inputHtml.toString();
        return inputHtml.replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;");
    }, 
}


function addMessage (from, text, time, _class) {
    if (text === null) return;

    if (time == null) {
        // if the time is null or undefined, use the current time.
        time = new Date();
    } 
    else if ((time instanceof Date) === false) {
        // if it's a timestamp, interpret it
        time = new Date(time);
    }

    //every message you see is actually a table with 3 cols:
    //  the time,
    //  the person who caused the event,
    //  and the content
    var messageElement = $(document.createElement("table"));

    messageElement.addClass("message");
    if (_class) {
        messageElement.addClass(_class);
    }

    // sanitize
    //text = util.toStaticHTML(text);

    // If the current user said this, add a special css class
    //var nick_re = new RegExp(CONFIG.nick);
    //if (nick_re.exec(text)) {
    //    messageElement.addClass("personal");
    //}

    /*if (1 && CONFIG.client != 'mobilesafari') {
        // replace URLs with links
        var rawlinks = text.match(/(\w+):\/\/([\w.-]+)\/(\S*)/g);

        if (rawlinks != null && rawlinks.length > 0) {
            for (var rl = 0; rl < rawlinks.length; rl++) {
                rl_arr = util.frHTMLEntities(rawlinks[rl]).match(/(\w+):\/\/([\w.-]+)\/(\S*)/);
                if (
                        rl_arr[2].toLowerCase().indexOf("youtube.com") != -1 ||
                        rl_arr[2].toLowerCase().indexOf("twitpic.com") != -1 
//                      rl_arr[2].toLowerCase().indexOf("yfrog.") != -1 
                    ) {
                    var d = new Date();
                    rl_id = rl_arr[2] + "-" + rl_arr[3];
                    rl_id = rl_id.replace(/(\.|\?|\=|\&)/g,'-')+"_"+d.getTime(); // function to generate rl_id
                    OEMBED[rl_id] = rawlinks[rl];
                    text = text.replace(rawlinks[rl], "<span id='" + rl_id + "'><a href=\"javascript:;\" onclick=\"oembed('" + rl_id +"');\">[expand " + rl_arr[2].toLowerCase() + "]</a></span>");
                }
            }
        }
    }*/
    //
    // 1. Find all instances of links string.match(/g);
    // 2. Filter each of the links to see if they are oEmbed compatible link[#].match(); push to array
    // 3. add wrapper around each link found string.replace
    // 4. dispatch oEmbed queries, callback replaces span with link to 'embed'
    //


    // 1. search for all the links in the message
    // 2. replace it with marker div + id
    // 3. when callback is done, present new information
    //
    function markerGenerator(s) {
        var o; //output
        var d = new Date();

        rl_arr = util.frHTMLEntities(s).match(/(\w+):\/\/([\w.-]+)\/(\S*)/);
        rl_id = rl_arr[2] + "-" + rl_arr[3];
        rl_id = rl_id.replace(/(\.|\?|\=|\&)/g,'-')+"_"+d.getTime(); // function to generate rl_id

        //var to_func = function () {process_link(s, rl_id);};
        //setTimeout(to_func,100);

        o  = '<a';
        o += ' target="_blank"';
        o += ' href="' + s   + '"';
        o += ' id="' + rl_id + '"';
        o += '>';
        o += s;
        o += '</a>';
        return o;
    }


    //text = text.replace(util.urlRE, markerGenerator);
    
    var curTime = util.timeString(time);
    //var curNick = util.toStaticHTML(from);
    var curNick = from;
    var hideTime = (curTime == STATE.prevTime) ? ' hide' : '';
    var hideNick = (curNick == STATE.prevNick) ? ' hide' : '';
    STATE.prevTime = curTime;
    STATE.prevNick = curNick;

    var content = '<tr>'
        + '  <td class="date' + hideTime + '">' + curTime + '</td>'
        + '  <td class="nick' + hideNick + '">' + curNick + '</td>'
        + '  <td class="msg-text">' + text  + '</td>'
        + '</tr>'
        ;
    messageElement.html(content);
        STATE.msgs.push(content);
        STATE.msgs_txt = STATE.msgs_txt + content;

    //the log is the stream that we view
    $("#log").append(messageElement);

    //always view the most recent message when it is added
    STATE.prevNick = util.toStaticHTML(from);
    STATE.prevTime = util.timeString(time);

    scrollDown();
}

function scrollDown() {
    /*if (CONFIG.client == 'mobilesafari') {
        updateSizes();
        myScroll.scrollToMax('400ms');
    }*/
    //else {
    //    $('#logwrap').scrollTo({top:'100%',left:'0%'});
    //}
}

$(document).ready(function () {

    /*if (CONFIG.autouser != '' ) {
        $('#nickInput').val(CONFIG.autouser);
    } 
    else if ($.cookie('stored_nick')) {
        $('#nickInput').val($.cookie('stored_nick'));
    }*/
    //submit new messages when the user hits enter if the message isnt blank
    $("#entry").keypress(function (e) {
        if (e.keyCode != 13) return;
        var msg = $("#entry").attr("value").replace("\n", "");
        if (!util.isBlank(msg)) send(msg);
        $("#entry").attr("value", ""); // clear the entry field.
    });

    $("#entry-btn").click(function () {
        var msg = $("#entry").attr("value").replace("\n", "");
        if (!util.isBlank(msg)) send(msg);
        $("#entry").attr("value", ""); // clear the entry field.
    });

    //$("#usersLink").click(outputUsers);

    //try joining the chat when the user clicks the connect button
    $("#connectButton").click(function () {
        signin();
        return false;
    });

    $("#connectForm").submit(function () {
        signin();
        return false;
    });

    $("#nickInput").keypress(function (e) {
        if (e.keyCode != 13) {return;}
        signin();
        return false;
    });

    // update the clock every second
    /*setInterval(function () {
        var now = new Date();
        $("#currentTime").text(util.timeString(now));
    }, 1000);

    if (CONFIG.debug) {
        $("#loading").hide();
        $("#connect").hide();
        return;
    }*/

    // remove fixtures
   // $("#log table").remove();

    /*jQuery.ajax({ cache: false
                , type: "GET"
                , dataType: "json"
                , url: CONFIG.node_url + "/who?jp=?"
                , data: {nick: CONFIG.nick, room: CONFIG.room}
                , success: function(session) {
                    nicks = session.nicks;
                    numusers = nicks.length.toString();
                    if (numusers > 0) {
                        $('#roomusercount').show();
                        var nick_string =  nicks.join(" ");
                        $('#roomuserlist').html(nick_string);
                        if (numusers == 1) {
                            $('#roomusercount .count').html(numusers + " user");
                        }
                        else {
                            $('#roomusercount .count').html(numusers + " users");
                        }
                    }
                }
    });*/

    //begin listening for updates right away
    //interestingly, we don't need to join a room to get its updates
    //we just don't show the chat stream to the user until we create a session
    //longPoll();

    showConnect();
    //showChat();



});
