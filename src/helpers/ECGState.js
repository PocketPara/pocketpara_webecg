const DefaultState = {
	_stateTimestamp: Date.now(),
	/*
	 *	ECG Data 
	 */
	isPlaying: false,
	fps: 0,
	ecgDisplay: {
		derivationNames: [
			'I',		'II',		'III',
			'aVL', 	'aVR', 	'aVF',
			'V1', 'V2', 'V3', 'V4', 'V5', 'V6'
		],
		// Amount of pixels to have as margins
		horizontalPadding: 50,
		verticalPadding: 50,
		textVerticalOffset: -10,
		// The width of the "clear" ruler
		rulerWidth: 5
	},
	// Generated automatically
	ecgRuntimeVariables: {},
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
		speed: 150
	}
};

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