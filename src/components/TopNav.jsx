import React from 'react';
import Logo from '../assets/rdicon_512-blue.png';
import './TopNav.scss';

export default class TopNav extends React.Component {

	state = {
		isPlaying: false
	}

	handleTogglePlay = () => {
		this.setState({
			isPlaying: !this.state.isPlaying
		});
	}

	render() {
		return <div className="topNav">

			<img src={Logo} alt="Logo" className="topNavLogo" />
			<h3 className="topNavTitle">
				PocketPara WebECG
			</h3>

			<div className="rightPart">
				<button onClick={this.handleTogglePlay}>{
					(this.state.isPlaying) ? <i className="fas fa-pause-circle"/> : <i className="fas fa-play-circle"/>
				}</button>
			</div>

		</div>;
	}
}