import React from 'react';
import './StatusBar.scss';

export default class StatusBar extends React.Component {

	state = {
		txtStatus: 'loading...',
		icoStatus: 'question',
		displayType: -1,
		speed: 25,
		fps: 0,
		// Menus
		showViewDropdown: false,
		showSpeedDropdown: false
	}

	/**
	 * Returns the name of the current view (E.G. 12-Channel ECG...)
	 */
	getViewTitle = id => {
		switch(id) {
			case 0:
				return '[4L] Limb';
			case 1:
				return '[12L] Limb + Chest';
			case 2:
				return 'coming soon (empty)';
			default:
				return 'loading...';
		}
	}

	/**
	 * Called when changing the current displayType
	 */
	handleChangeDisplayType = (id) => {
		let statusBar = this.props.ecgState.getState().statusBar;
		statusBar.displayType = id;
		this.props.ecgState.setState({
			statusBar
		});
	}

	handleChangeSpeed = speed => {
		let statusBar = this.props.ecgState.getState().statusBar;
		statusBar.speed = speed;
		this.props.ecgState.setState({
			statusBar
		});
	}

	componentDidMount() {
		this.props.ecgState.subscribe( (state, updatedProps) => {
			this.setState({
				txtStatus: state.statusBar.txtStatus,
				icoStatus: state.statusBar.icoStatus,
				displayType: state.statusBar.displayType,
				speed: state.statusBar.speed
			});
		}, ['statusBar']);

		this.props.ecgState.subscribe( (state, updatedProps) => {
			this.setState({
				fps: state.fps
			});
		}, ['fps'])

		// Initial update call
		this.props.ecgState.notifySubscribers(['statusBar']);
	}

	render() {
		return <div className="statusBar">
			
			<span className="lblStatus">
				<i className={"fas fa-" + this.state.icoStatus}></i>
				&nbsp;
				<div>&nbsp;{this.state.txtStatus}</div>
			</span>


			<span 
				className="lblDerivations" 
				onClick={()=>{this.setState({
					showViewDropdown: !this.state.showViewDropdown
				})}}>

				{ /* Configure Display Type (4-Lead, 12-Lead) */}
				<div className="hoverBox">
					<i className={"fas fa-eye"}></i>
					&nbsp;
					<div>&nbsp;{this.getViewTitle(this.state.displayType)}</div>
				</div>

				{ this.state.showViewDropdown && <div className="dropUp">
					<div 
						onClick={()=>{this.handleChangeDisplayType(0)}}
						className="option">
						<i className="fas fa-eye" />&nbsp; {this.getViewTitle(0)}
					</div>
					<div 
						onClick={()=>{this.handleChangeDisplayType(1)}}
						className="option">
						<i className="fas fa-eye" />&nbsp; {this.getViewTitle(1)}
					</div>
					<div 
						onClick={()=>{this.handleChangeDisplayType(2)}}
						className="option">
						<i className="fas fa-eye" />&nbsp; {this.getViewTitle(2)}
					</div>
				</div> }
			</span>

		<span
			className="lblSpeed"
			onClick={()=>{this.setState({
				showSpeedDropdown: !this.state.showSpeedDropdown
			})}}>

				{ /* Configure ECG Speed */ }
				<div className="hoverBox">
					<i className={"fas fa-tachometer-alt"} />
					&nbsp;
					<div>&nbsp;{this.state.speed} mm/s</div>
				</div>

				{ this.state.showSpeedDropdown && <div className="dropUp">
					<div 
							onClick={()=>{this.handleChangeSpeed(25)}}
							className="option">
						<i className="fas fa-tachometer-alt" /> &nbsp;Speed: 25 mm/s
					</div>
					<div 
							onClick={()=>{this.handleChangeSpeed(50)}}
							className="option">
						<i className="fas fa-tachometer-alt" /> &nbsp;Speed: 50 mm/s
					</div>
					<div 
							onClick={()=>{
								//this.handleChangeSpeed(50)
								let input = prompt("Enter a speed (in mm/s)", this.state.speed);
								if(isNaN(input)) {
									alert("Enter a valid number and try again!");
								} else {
									if(input > 1500) {
										alert("Please enter a value below 1500 mm/s.");
										return;
									}
									this.handleChangeSpeed(Math.abs(parseInt(input)));
								}
							}}
							className="option">
						<i className="fas fa-pen" /> &nbsp;Custom speed
					</div>
				</div>}

			</span>


			<span className="lblFps">
				<div className="hoverBox">
					<i className={"fas fa-wave-square"} />
					&nbsp;FPS
					<div>&nbsp;{this.state.fps}</div>
				</div>
			</span>

		</div>;
	}
}