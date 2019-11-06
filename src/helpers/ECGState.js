const DefaultState = {
	_stateTimestamp: Date.now(),
	isPlaying: false
};

/**
 * Main state handler for the ecg itself
 */
export default class ECGState {

	constructor() {
		this._state = DefaultState;
		this._subscribers = [];

		// Debug
		window.getState = () => {
			return this;
		}
	}

	/**
	 * Adds a function that is called whenever a state update is performed
	 * 
	 * @param {function} callback The function that is called on updates
	 * @returns {string} The id of the callback (needed for unsubscribing)
	 */
	subscribe( callback ) {
		const id = 'es_' + Date.now();

		this._subscribers.push({
			id: Date.now() + '_sub',
			callback
		});

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
			sub.callback(this._state, updatedProps);
		}
	}

}