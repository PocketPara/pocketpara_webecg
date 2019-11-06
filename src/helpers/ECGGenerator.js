/**
 * The generator for the ecg coordinates
 */
export default class ECGGenerator {

	constructor(state) {
		// Keep access to the state
		this.ecgstate = state;
		/** Returns the current ecg state */
		this.state = ()=>{ return state.getState(); };

		// The current time
		this.time = 0;

		// The values of the moment before
		this.previousValues = [
			0,0,0,
			0,0,0,
			0,0,0,0,0,0
		];

	}

	/**
	 * Returns the current value of a derivation
	 * @param {number} derivationIndex The index of the derivation to get the value of
	 */
	getValue( derivationIndex = 0 ) {
		return Math.sin(this.time/10) * 80;
	}

	/**
	 * Continues to the next moment/frame
	 */
	next() {
		this.time += parseInt(this.state().statusBar.speed / 50);
	}


}