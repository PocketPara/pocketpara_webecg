const DefaultState = {
	_stateTimestamp: Date.now(),
	// if animation is active
	isPlaying: false,
	fps: 0,
	/**
	 * ECG Displaying options
	 */
	ecgDisplay: {
		derivationNames: [
			'I',		'II',		'III',
			'aVL', 	'aVR', 	'aVF',
			'V1', 'V2', 'V3', 'V4', 'V5', 'V6'
		],
		// Amount of pixels to have as margins
		horizontalMargin: 50,
		verticalMargin: 50,
		textVerticalOffset: -10,
		// The width of the "clear" ruler
		rulerWidth: 15,
		defaultAmplitude: 75
	},
	/*
	*		Status Bar (on the bottom)
	*/
	statusBar: {
		txtStatus: 'OK',
		icoStatus: 'info',
		// Display type, defines which type of leads are displayed
		// 0 -> 4-Channel ECG
		// 1 -> 12-Channel ECG
		displayType: 1,
		// Speed in mm/sec
		speed: 50
	},
	/**
	 * The ecg derivation configurations
	 */
	ecgConfig: [

		{
			// Todo: onComplete method?
			// The iso-electric lines between beats
			iso: {
				// duration of this component ( timeInc(ms) to set in milliseconds)
				duration: ()=>{return time(Math.random() * 4000)}, 
				fnc: p => {return 0;}
			},
			pWave: {
				// 120ms duration
				duration: ()=>{return time(115)},
				// https://www.desmos.com/calculator/lwfoprhudy
				fnc: p => { return -0.25 * Math.pow( p - 0.5, 2) + 0.06 }
			},
			pqTime: {
				// duration (minus pWave),
				duration: ()=>{return time( 195 - 115)},
				fnc: p => { return 0; }
			},
			qWave: {
				duration: ()=>{return time(35)},
				fnc: p => { return -0.08*p; }
			},
			rWave: {
				duration: ()=>{return time(30)},
				fnc: p => { return 0.5*p; }
			},
			sWave: {
				duration: ()=>{return time(30)},
				fnc: p => { return -0.4*p; }
			},
			stSegment: {
				duration: ()=>{return time(120)},
				fnc: p => { return 0; }
			},
			tWave: {
				duration: ()=>{return time(125)},
				fnc: p => { return -0.4 * Math.pow( p - 0.5, 2) + 0.08 }
			}
		}

	]
};
/**
 * Returns the amount of frames that equals a duration in ms
 * 
 * @param {number} milliseconds The time in milliseconds
 */
export function time( milliseconds ) {
	const fps = 60; // TODO: load
	const frameMs = Math.round((1000 / fps)*100)/100;
	const time = Math.round( (frameMs / milliseconds) * 100)/100;
	return (time > 0.000000) ? time : 0.001;
}

/**
 * Main state handler for the ecg itself
 */
export default class ECGState {

	constructor() {
		this._state = DefaultState;
		this._subscribers = [];

		// Debug
		window.ecg = this;
	}

	/**
	 * Adds a function that is called whenever a state update is performed
	 * 
	 * @param {function} callback The function that is called on updates
	 * @param {string[]} filter A list of properties to listen on
	 * @param {bool} initialCall If true, call the callback once registered
	 * @returns {string} The id of the callback (needed for unsubscribing)
	 */
	subscribe( callback, filter = [], initialCall = false ) {
		const id = 'es_' + Date.now();
		filter = (typeof filter == 'string') ? [filter] : filter;

		this._subscribers.push({
			id: Date.now() + '_sub',
			callback,
			filter
		});
		if(initialCall) {
			callback(this._state, filter);
		}

		return id;
	}

	/**
	 * Removes a subscription
	 * 
	 * @param {string} id The id of the subscription (passed when subscription was made)
	 * @returns {bool} Success, if false, there was no subscription found with that id
	 */
	unsubscribe( id ) {
		for(let i = 0; i < this._subscribers.length; i++) {
			if( this._subscribers[i].id === id ) {
				// Remove it
				this._subscribers.splice(i,1);
				return true;
			}
		}
		return false;
	}

	/**
	 * Updates the state
	 * 
	 * @param {object} updates An object with properties to update (only first-level, others can be done manually)
	 * @param {bool} silent If true, subscribers won't be notified of the change
	 */
	setState( updates, silent = false ) {
		this._state._stateTimestamp = Date.now();
		let updatedProps = [];
		for( let prop in updates ) {
			updatedProps.push(prop);
			this._state[prop] = updates[prop];
		}
		if(!silent)this.notifySubscribers(updatedProps);
		return this._state;
	}

	/**
	 * Sets the whole state tree, can't be done silently
	 * 
	 * @param {object} newStateTree The new state
	 */
	setTree( newStateTree ) {
		this._state = newStateTree;
		this.notifySubscribers();
	}

	/**
	 * Returns the current state
	 * 
	 * @returns {object} The current state
	 */
	getState() {
		return this._state;
	}

	/**
	 * Notifies all subscribers of the current state
	 * 
	 * @param {string[]} updatedProps A list of the updated properties
	 */
	notifySubscribers( updatedProps = [] ) {
		for(let sub of this._subscribers) {
			if(sub.filter.length > 0) {
				// Only listening on proplist
				for(let filterItem of sub.filter) {
					if(updatedProps.includes(filterItem)) {
						sub.callback(this._state, updatedProps);
					}
				}
			} else {
				// General subscription
				sub.callback(this._state, updatedProps);
			}
			
		}
	}

}