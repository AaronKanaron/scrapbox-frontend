/*- Imports -*/
import React from "react";
import Navbar from "../components/molecules/Navbar";
import "../styles/index.scss"
import Cookies from "js-cookie";
import Globals from "../functional/Globals";
import SettingsTab from "./tabs/SettingsTab";
import ChatTab from "./tabs/ChatTab";
import "../styles/joinroom.scss";

/*- Constants -*/
const MAX_WEBSOCKET_CONNECTION_RETRIES = 5;

/*- Main body -*/
export default class JoinRoom extends React.PureComponent {
	constructor(props) {
		super(props);

        /*- Changeable -*/
		this.state = {
            isMounted: false,
            openTab: "settings",
            players: [],
            pipe: 0
        };

        /*- Function bindings -*/
		this.mountWebsocket     = this.mountWebsocket.bind(this);
		this.addPlayer          = this.addPlayer.bind(this);

        /*- Vars -*/
        this.websocket = null;
        this.websocketConnectionRetries = 0;
        this.jwtToken = Cookies.get("token");

        /*- Use Refs -*/
        this.scrollIntoViewElement = React.createRef()
        this.pipe                  = React.createRef()
	}

    /*- Initialize websocket connection -*/
	mountWebsocket() {
        if (!this.state.isMounted) { return; };

        /*- Change vars -*/
        this.websocket = new WebSocket(Globals.websocketAddress);
        this.websocketConnectionRetries += 1;

        /*- Check websocket availability -*/
        if (this.websocketConnectionRetries > MAX_WEBSOCKET_CONNECTION_RETRIES) {
            console.warn("Connection problems to websocket after", MAX_WEBSOCKET_CONNECTION_RETRIES, "tries.");
            return;
        } else if (this.websocket == null) {
            return this.mountWebsocket();
        }

        /*- Websocket data -*/
		const e = {
			destination: "join-room",
			data: JSON.stringify({
				jwt: this.jwtToken,
                room_id: "95415",
			}),
		};

        /*- Websocket did mount -*/
		this.websocket.onopen = () => {
            console.log("Websocket connection established!"); 
            if (!this.state.isMounted) { return; };

			/*- Send join room request -*/
			this.websocket.send(JSON.stringify(e));
		};

        /*- Websocket recieve from server -*/
		this.websocket.onmessage = (e) => {
			console.log("MESSAGE: ", JSON.parse(e.data));
		};

        /*- Websocket did unmount -*/
		this.websocket.onclose = () => {
            console.log("Websocket closed");

            /*- Retry connect -*/
            if (this.state.isMounted) {
                return this.mountWebsocket();
            };
		};
	}

    /*- Initialize -*/
    componentDidMount() {
        /*- Fetch create-room endpoint -*/
        this.setState({ isMounted: true }, () => {
            console.log("Will mount");
            this.mountWebsocket();
        })
    }

    /*- Unmount -*/
    componentWillUnmount() {
        this.setState({ isMounted: true })
    }

    /*- Add player -*/
    addPlayer(player) {
        
        this.setState({
            pipe: [player[0] + 5],
            players: [...this.state.players, player]
        }, () => {
            console.log(this.state.players);
        });
    }

    /*- Render to DOM -*/
    render() {
        return (
            <main className="joinRoom">
                {/* <button onClick={() => this.addPlayer([Math.random()*100, Math.random()*100])}>add player</button> */}
                <Board players={this.state.players.map(([x, y], index) => <PlayerSprite x={x} y={y} key={index} username="username" />)} />

                <div className="room-container">
                    <div className="tabs">
                        <div className={"tab" + (this.state.openTab == "settings" ? " active" : "")} onClick={() => this.setState({ openTab: "settings" })}>
                            <h1>Settings</h1>
                        </div>
                        <div className={"tab" + (this.state.openTab == "chat" ? " active" : "")} onClick={() => this.setState({ openTab: "chat" })}>
                            <h1>Chat</h1>
                        </div>
                    </div>

                    <div className="room-content">
                        {this.state.openTab == "settings" ? <SettingsTab /> : <ChatTab />}
                    </div>
                </div>
            </main>
        )
    }
}

/*- Players in their frames on the whiteboard -*/
class PlayerSprite extends React.PureComponent {
    constructor(props) {
        super(props);

        /*- Statics -*/
        this.posX = 0;
        this.posY = 0;
        this.globalMarginTop = 20;
        this.globalMarginBottom = 30;
        this.globalMarginLeft = 2;
        this.globalMarginRight = 15;

        /*- Prop getters -*/
        this.inputX = this.props.x;
        this.inputY = this.props.y;
        this.name = this.props.username;

        /*- Function bindings -*/
        this.getPosX = this.getPosX.bind(this);
        this.getPosY = this.getPosY.bind(this);

        this.frames = [
            "/assets/frames/circle.svg",
            "/assets/frames/rectangle-vertical.svg",
            "/assets/frames/square.svg",
            "/assets/frames/triangle.svg",
        ]
        this.framesClasses = [
            "circle",
            "rectangle-vertical",
            "square",
            "triangle",
        ]

        this.profiles = [
            "./assets/profiles/bush.svg",
            "./assets/profiles/clown.svg",
            "./assets/profiles/knight.svg",
            "./assets/profiles/mad.svg",
        ];

        this.getProfile = this.getProfile.bind(this);
        this.getFrame = this.getFrame.bind(this);
        this.index = Math.floor(Math.random()*this.profiles.length);

    }

    /*- Getters for pos -*/
    getPosX() {
        return wrapNumber(this.inputX, 0, 100, 0 + this.globalMarginLeft, 100 - this.globalMarginRight).toString() + "%"
    }
    getPosY() {
        return wrapNumber(this.inputY, 0, 100, 0 + this.globalMarginTop, 100 - this.globalMarginBottom).toString() + "%"
    }

    getFrame() {
        return this.frames[Math.floor(Math.random()*this.frames.length)]
    }
    getFrameClass() {
        return this.framesClasses[Math.floor(Math.random()*this.framesClasses.length)]
    }
    getProfile() {
        return this.profiles[Math.floor(Math.random()*this.profiles.length)]
    }

    /*- Render self -*/
    render() {
        return (
            <div className="player-wrapper" style={{ "left": this.getPosX(), "top": this.getPosY() }}>
                <div className="player">

                    <img src={this.frames[this.index]} alt="player"/>
                    <div className={`mask ${this.framesClasses[this.index]}`}>
                        <img src={this.profiles[this.index]}/>
                    </div>

                </div>
                <p>{this.name}</p>
            </div>
        );
    };
}
/*- Wrap number between two ranges -*/
function wrapNumber(number, input_min, input_max, output_min, output_max) {
    return output_min + (output_max - output_min) * ((number - input_min) / (input_max - input_min));
}
/*- Distribute points -*/
function distributePoints(radius, points) {
    let final = [];

    /*- New point has to be min radius away from all other points -*/
    for (let i = 0; i < points; i++) {
        let point = [Math.random() * 100, Math.random() * 100];
        let tries = 0;

        /*- Check if point is too close to other points -*/
        while (final.some(([x, y]) => Math.hypot(x - point[0], y - point[1]) < radius)) {
            tries += 1;
            if (tries > 100) { break; };
            point = [Math.random() * 100, Math.random() * 100];
        };

        final.push(point);
    };

    return final;
}
/*- We need to have board as a individual component (PureComponent) to prevent re-renders on tab switch -*/
class Board extends React.PureComponent {
    render() {
        return (
            <div className="player-container">
                <div className="background">
                    <img src="/assets/board.svg" className="background__image" />
                </div>
                <div className="logo-container">
                    <img src="/logo/scrapbox-bordered.svg" alt="logo" className="logo"/>
                </div>

                <div className="players">
                    {this.props.players}
                </div>
            </div>
        )
    }
}