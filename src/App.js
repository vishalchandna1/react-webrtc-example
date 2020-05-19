import React, { useState, useEffect } from "react";
// import logo from "./logo.svg";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Peer from "peerjs";
import TextField from "@material-ui/core/TextField";

var lastPeerId = null;
var peer = null; // own peer object
var conn = null;

function initialize(setRoomId) {
	// Create own peer object with connection to shared PeerJS server
	peer = null;
	peer = new Peer(null, {
		debug: 2,
	});

	peer.on("open", function (id) {
		// Workaround for peer.reconnect deleting previous id
		if (peer.id === null) {
			console.log("Received null id from peer open");
			peer.id = lastPeerId;
		} else {
			lastPeerId = peer.id;
		}

		setRoomId(peer.id);
		console.log("ID: " + peer.id);
	});
	peer.on("connection", function (c) {
		// Disallow incoming connections
		// c.on("open", function () {
		// 	c.send("Sender does not accept incoming connections");
		// 	setTimeout(function () {
		// 		c.close();
		// 	}, 500);
		// });
	});
	peer.on("call", async (call) => {
		console.log("Call called");
		var stream = await navigator.mediaDevices.getUserMedia(
			{ video: true, audio: true },
			(stream) => {
				console.log("vishal stream -", stream);
			},
			(err) => {
				console.error("Failed to get local stream", err);
			}
		);
		console.log("peer stream - ", stream);
		call.answer(stream); // Answer the call with an A/V stream.
		call.on("stream", (remoteStream) => {
			console.log("senderStream- ", remoteStream);
			document.getElementById("svideo").srcObject = remoteStream;
		});
	});
	peer.on("disconnected", function () {
		// status.innerHTML = "Connection lost. Please reconnect";
		console.log("Connection lost. Please reconnect");

		// Workaround for peer.reconnect deleting previous id
		peer.id = lastPeerId;
		peer._lastServerId = lastPeerId;
		peer.reconnect();
	});
	peer.on("close", function () {
		conn = null;
		// status.innerHTML = "Connection destroyed. Please refresh";
		console.log("Connection destroyed");
	});
	peer.on("error", function (err) {
		console.log(err);
		// alert("" + err);
	});
}

function App() {
	const [isRoomCreateVisible, setRoomCreatedVisible] = useState(false);
	const [roomId, setRoomId] = useState(null);
	const [isJoinRoomVisible, setJoinRoomVisible] = useState(false);

	return (
		<div className="App">
			<Button
				variant="contained"
				color="primary"
				onClick={initialize.bind(this, setRoomId)}
			>
				Create a Room
			</Button>

			{roomId && (
				<>
					{" "}
					<div className="margin-top">Your room id is {roomId}</div>
					<video autoplay="true" id="svideo"></video>
				</>
			)}

			<div className="margin-top">
				{!roomId && (
					<Button
						variant="contained"
						color="primary"
						onClick={setJoinRoomVisible.bind(this, true)}
					>
						Join a Room
					</Button>
				)}
			</div>

			{isJoinRoomVisible && (
				<div className="margin-top">
					<JoinRoom />
				</div>
			)}
		</div>
	);
}

const useStyles = makeStyles((theme) => ({
	root: {
		"& > *": {
			margin: theme.spacing(1),
			width: "25ch",
		},
	},
}));

var rlastPeerId = null;
var rpeer = null; // own peer object
var rconn = null;
// var recvId = document.getElementById("receiver-id");
// var status = document.getElementById("status");

function receiverInit() {
	// Create own peer object with connection to shared PeerJS server
	rpeer = new Peer(null, {
		debug: 2,
	});

	rpeer.on("open", function (id) {
		// // Workaround for peer.reconnect deleting previous id
		// if (rpeer.id === null) {
		// 	console.log("Received null id from peer open");
		// 	rpeer.id = lastPeerId;
		// } else {
		// 	rlastPeerId = rpeer.id;
		// }
		// console.log("ID: " + rpeer.id);
		// document.getElementById("receiver-id").innerHTML = "ID: " + rpeer.id;
		// document.getElementById("status").innerHTML = "Awaiting connection...";
	});
	rpeer.on("connection", function (c) {
		// Allow only a single connection
		if (rconn && rconn.open) {
			c.on("open", function () {
				c.send("Already connected to another client");
				setTimeout(function () {
					c.close();
				}, 500);
			});
			return;
		}

		rconn = c;
		console.log("Connected to: " + rconn.peer);
		navigator.mediaDevices.getUserMedia(
			{ video: true, audio: true },
			(stream) => {
				console.log("remoteStream", stream);

				// const call = rpeer.call(rconn.peer, stream);
				// call.on("stream", (remoteStream) => {
				// 	document.getElementById("rvideo").src = window.URL.createObjectURL(
				// 		remoteStream
				// 	);
				// });
			},
			(err) => {
				console.error("Failed to get local stream", err);
			}
		);
		document.getElementById("status").innerHTML = "Connected";
		rready();
	});
	rpeer.on("disconnected", function () {
		document.getElementById("status").innerHTML =
			"Connection lost. Please reconnect";
		console.log("Connection lost. Please reconnect");

		// Workaround for peer.reconnect deleting previous id
		rpeer.id = lastPeerId;
		rpeer._lastServerId = lastPeerId;
		rpeer.reconnect();
	});
	rpeer.on("close", function () {
		rconn = null;
		document.getElementById("status").innerHTML =
			"Connection destroyed. Please refresh";
		console.log("Connection destroyed");
	});
	rpeer.on("error", function (err) {
		console.log(err);
		alert("" + err);
	});
}

function rready() {
	rconn.on("data", function (data) {
		console.log("Data recieved");
		var cueString = '<span className="cueMsg">Cue: </span>';
		switch (data) {
			case "Go":
				// go();
				// addMessage(cueString + data);
				break;
			case "Fade":
				// fade();
				// addMessage(cueString + data);
				break;
			case "Off":
				// off();
				// addMessage(cueString + data);
				break;
			case "Reset":
				// reset();
				// addMessage(cueString + data);
				break;
			default:
				// addMessage("<span class=\"peerMsg\">Peer: </span>" + data);
				break;
		}
	});
	rconn.on("close", function () {
		document.getElementById("status").innerHTML =
			"Connection reset<br>Awaiting connection...";
		rconn = null;
	});
}

function JoinRoom() {
	const classes = useStyles();
	const [roomInput, setRoomInput] = useState("");

	useEffect(() => {
		receiverInit();
	}, []);

	function join(roomInput) {
		console.log(rpeer);
		// Close old connection
		if (rconn) {
			rconn.close();
		}

		// Create connection to destination peer specified in the input field
		rconn = rpeer.connect(roomInput, {
			reliable: true,
		});

		rconn.on("open", async function () {
			document.getElementById("status").innerHTML =
				"Connected to: " + rconn.peer;
			console.log("Connected to: " + rconn.peer);
			let stream = await navigator.mediaDevices.getUserMedia(
				{ video: true, audio: true },
				(stream) => {
					console.log("remoteStream", stream);
				},
				(err) => {
					console.error("Failed to get local stream", err);
				}
			);
			const call = rpeer.call(rconn.peer, stream);
			call.on("stream", (remoteStream) => {
				document.getElementById("rvideo").srcObject = remoteStream;
				console.log("remoteStream");
			});
			// Check URL params for comamnds that should be sent immediately
			// var command = getUrlParam("command");
			// if (command)
			//     conn.send(command);
		});
		// Handle incoming data (messages only since this is the signal sender)
		rconn.on("data", function (data) {
			console.log("ondata -", data);
			// addMessage("<span class=\"peerMsg\">Peer:</span> " + data);
		});

		rconn.on("close", function () {
			document.getElementById("status").innerHTML = "Connection closed";
		});
	}

	return (
		<form className={classes.root} noValidate autoComplete="off">
			<TextField
				id="standard-basic"
				label="Standard"
				value={roomInput}
				onChange={(e) => {
					console.log(e.target.value);
					setRoomInput(e.target.value);
				}}
			/>
			<Button
				variant="contained"
				color="primary"
				onClick={(e) => {
					if (roomInput.length != null) {
						join(roomInput);
					}
				}}
			>
				Join a Room
			</Button>
			<div id="status" className="status margin-top"></div>
			<div id="receiver-id" title="Copy this ID to the input on">
				ID:
			</div>

			<video autoplay="true" id="rvideo"></video>
		</form>
	);
}

export default App;
