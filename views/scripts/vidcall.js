var users_joined = []
var video_out = document.getElementById("vid-box");
var vid_thumb = document.getElementById("vid-thumb");
var active_callers = []
var username = ""
var test1;
var test2;
var droppedCalls = [];

var current_calls = {};
var activeVideos = {};

var current_chat = null;

var users_called = []

function login() {
	video_out = document.getElementById("vid-box");
	vid_thumb = document.getElementById("vid-thumb");
	
	var myPhone = window.myPhone = PHONE({
		number : document.getElementById("username").value,
		publish_key   : 'pub-c-818b704b-cee3-430e-92bc-7b05896f506e',
		subscribe_key : 'sub-c-8eae2880-a8d0-11ea-9d71-da51a68c7938'
	});

	var pubnub = window.pubnub = new PubNub({
		publish_key   : 'pub-c-818b704b-cee3-430e-92bc-7b05896f506e',
		subscribe_key : 'sub-c-8eae2880-a8d0-11ea-9d71-da51a68c7938',
		uuid : document.getElementById("username").value
	});

	pubnub.addListener({
	    message: function(m) {
	    	var p = document.createElement('p');
	    	p.innerHTML = m.publisher + " :  ";
	    	p.innerHTML += m.message.text;
	    	document.getElementById("chatDisplay").appendChild(p);
	    }
	});

	username = document.getElementById("username").value;
	myPhone.ready(function(){
		if (vid_thumb.children.length == 0) {
			my_vid = myPhone.camera.video();
			my_vid.setAttribute("muted", "muted");
			vid_thumb.appendChild(myPhone.camera.video());
		}
	});
	myPhone.receive(function(new_caller){
		new_caller.connected(function(cur_caller){
			if (activeVideos[cur_caller.number] == null)
			{
				cur_caller.video.id = cur_caller.number;
				cur_caller.video.setAttribute("width", "300px")
				activeVideos[cur_caller.number] = cur_caller.video;
				console.log(cur_caller.number + " joined the call");
			}
			video_out.innerHTML = "";
			for (vid in activeVideos)
			{
				if (activeVideos[vid] == null)
				{
					myPhone.dial(vid);
				}
				else
				{
					video_out.appendChild(activeVideos[vid]);
				}
			}
			if (current_chat == null) {
				var p1;
				var p2;

				if (username < cur_caller.number)
				{
					p1 = username;
					p2 = cur_caller.number;
				}
				else
				{
					p1 = cur_caller.number;
					p2 = username;
				}
				var room_name = p1 + "_" + p2;
				pubnub.subscribe({
					channels : [room_name],
					restore : true
				});

				current_chat = room_name;	
			}
		});
		new_caller.ended(function(cur_caller){
			activeVideos[cur_caller.number] = null;
			console.log(cur_caller.number);
			users_called.splice(users_called.indexOf(cur_caller.number), 1);
			console.log(cur_caller.number + " left the call");
		})
	});
}

function addRemainingCallers(callers) {
	for (i = 0; i < callers.length; i++) {
		if (users_called.indexOf(callers[i]) == -1) {
			if (callers[i] != username) {
				myPhone.hangup(callers[i])
				callUser(callers[i])
				users_called.push(callers[i])
			}
		}
	}
}

function joinRoom() {
	var room_name = document.getElementById("room").value;
	if (myPhone == null)
	{
		alert("Login First!");
		return;
	}
	$.ajax({
		url: document.location.origin + "/api/video",
		headers: { "User_Email": "aditya.baskar@gmail.com", "Auth_Token": "test"},
		type: "POST",
		data: {username: username, room_name: room_name},
		success: function(data) {

			for (i = 0; i < data["users"].length; i++)
			{
				if (data["users"][i] != myPhone.number()) {
					callUser(data["users"][i]);
				}
			}
		},
		error: function(data) {
			console.log(data);
		}
	});

	if (current_chat != null)
	{
		pubnub.unsubscribe({
			channels : [current_chat]
		})
	}
	pubnub.subscribe({
		channels : [room_name],
		restore : true
	});

	current_chat = room_name;
	
}

function sendText() {
	if (current_chat == null) {
		alert("Join a chat room first!");
		return;
	}
	var chat_text = document.getElementById("chatbox").value;
	pubnub.publish({
		channel : current_chat,
		message : {
			text : chat_text
		}
	},
	function (status, response) {
		console.log(status);
		console.log(response);
	});

}

function updateCallers() {
	var room_name = document.getElementById("number").value;
	
	$.ajax({
		url: document.location.origin + "/api/video?room_name=" + room_name,
		type: "GET",
		headers: { "User_Email": "aditya.baskar@gmail.com", "Auth_Token": "test"},
		success: function(result) {
			addRemainingCallers(result["users"])
		},
		error: function(error) {
			alert("Login First! Type in username and click login before typing the room name");
			console.log(error);
		}
	});
}

function callUser(number) {
	if (current_calls[number] == null)
	{
		current_calls[number] = myPhone.dial(number);
		test1 = current_calls[number];
		console.log(current_calls[number]);
	}
}

function end(){
	myPhone.hangup();
}

function mute(){
	myPhone.camera.toggleAudio();
	if (document.getElementById("mute").innerHTML == "Unmute")
	{
		$('#mute').html('mute');
	}
	else
	{
		$('#mute').html('Unmute');
	}
}

function pause(){
	myPhone.camera.toggleVideo();
	if (document.getElementById("pause").innerHTML == "Unpause")
	{
		$('#pause').html('Pause');
	}
	else
	{
		$('#pause').html('Unpause');
	}
}

function makeCall() {
	if (myPhone == null)
	{
		alert("Login First!");
		return;
	}
	var num = document.getElementById("number").value;
	var p1;
	var p2;

	if (username < num)
	{
		p1 = username;
		p2 = num;
	}
	else
	{
		p1 = num;
		p2 = username;
	}
	var room_name = p1 + "_" + p2;
	if (current_chat != null)
	{
		pubnub.unsubscribe({
			channels : [current_chat]
		})
	}
	pubnub.subscribe({
		channels : [room_name],
		restore : true
	});

	current_chat = room_name;
	callUser(document.getElementById("number").value);
}
/*
function joinCall(){
	var viewer = window.viewer = PHONE({
	    number		: username + "_viewer",
		publish_key   : 'pub-c-c9cf28b9-7b29-4e81-a591-bbafd2f0f22b',
		subscribe_key : 'sub-c-d6f62dcc-972d-11ea-84ed-1e1b4c21df71'
	});
	
	viewer.ready(function(){
		for (i = 0; i < active_callers.length; i++) {
			if (!users_joined.includes(active_callers[i] + "_sender") && window.broadcaster.number != active_callers[i] + "_sender")
			{
				var cur_call = viewer.dial(active_callers[i] + "_sender");
				if (cur_call)
				{
					current_calls[cur_call.number] = cur_call;
				}
			}
		}
		document.getElementById("username").style.background="#55ff5b";
		if (vid_thumb.children.length == 0) {
			vid_thumb.appendChild(viewer.camera.video());
		}
	});
	

	viewer.receive(function(new_broadcaster){
	    new_broadcaster.connected(function(cur_broadcaster){
	    	if (!users_joined.includes(cur_broadcaster.number))
			{
				cur_broadcaster.video.id = cur_broadcaster.number;
				document.body.appendChild(cur_broadcaster.video);
				users_joined.push(cur_broadcaster.number);
			}
			else
			{
				console.log("duplicate call " + cur_broadcaster.number);
			}
		});
		new_broadcaster.ended(function(cur_broadcaster){
			document.body.removeChild(document.getElementById(cur_broadcaster.number));
			users_joined.pop(cur_broadcaster.number);
			console.log(cur_broadcaster.number + " ended the call")
		});
	});

	test2 = viewer;
}

function set_active_people() {
	active_callers = []
	if (username == "adi1")
	{
		active_callers.push("adi2");
		active_callers.push("adi3");
	}
	else if (username == "adi2")
	{
		active_callers.push("adi1");
		active_callers.push("adi3");	
	}
	else
	{
		active_callers.push("adi2");
		active_callers.push("adi1");
	}
}*/