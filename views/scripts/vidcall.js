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

function login() {
	video_out = document.getElementById("vid-box");
	vid_thumb = document.getElementById("vid-thumb");
	
	var myPhone = window.myPhone = PHONE({
		number : document.getElementById("username").value,
		publish_key   : 'pub-c-c9cf28b9-7b29-4e81-a591-bbafd2f0f22b',
		subscribe_key : 'sub-c-d6f62dcc-972d-11ea-84ed-1e1b4c21df71',
		img : 'https://i.ytimg.com/vi/ZmdzAFTU2kY/hqdefault.jpg'
	});
	myPhone.ready(function(){
		if (vid_thumb.children.length == 0) {
			vid_thumb.appendChild(myPhone.camera.video());
		}
	});
	myPhone.receive(function(new_caller){
		new_caller.connected(function(cur_caller){
			if (activeVideos[cur_caller.number] == null)
			{
				cur_caller.video.id = cur_caller.number;
				activeVideos[cur_caller.number] = cur_caller.video;
				console.log(cur_caller.number + " joined the call");
			}
			video_out.innerHTML = "";
			for (vid in activeVideos)
			{
				video_out.appendChild(activeVideos[vid]);
			}
		});
		new_caller.ended(function(cur_caller){
			activeVideos[cur_caller.number] = null;
			console.log(cur_caller.number + " left the call");
		})
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