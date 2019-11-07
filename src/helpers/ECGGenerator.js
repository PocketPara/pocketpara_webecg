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

		// Defines which part is active
		this.isActive = [
			true, // iso
			false, // pWave
			false, // pqSegment
			false, // qWave
			false, // rWave
			false, // sWave
			false, // stSegment
			false, // tWave
			false, // tuSegment
			false // uWave
		];
		// Defines by how many percentages the current part is completed (> 1 -> go to next part)
		this.activePartCompletion = 0.00;

	}

	/**
	 * Returns the current value of a derivation
	 * @param {number} derivationIndex The index of the derivation to get the value of
	 */
	getValue( derivationIndex = 0 ) {
		const derivationCfg = this.state().ecgConfig[0]; // replace 0 with derivationIndex

		// continuation if ratio > 1
		if(this.activePartCompletion >= 1.00) {
			let currentIndex = this.isActive.length-1;
			for(let i = 0; i < this.isActive.length; i++) {
				if(this.isActive[i]) {
					currentIndex = i;
				}
			}
			// disable current
			this.isActive[currentIndex] = false;
			// enable next
			this.isActive[++currentIndex % this.isActive.length] = true;
			this.activePartCompletion = 0.0;

		}


		// amplitude
		const amp = this.state().ecgDisplay.defaultAmplitude || 75;
		const timeMult = 0.1;

		let value = 0;
		// iso electric line
		if(this.isActive[0]) {
			 value = derivationCfg.iso.fnc( this.activePartCompletion );
			 this.activePartCompletion += derivationCfg.iso.duration() * timeMult;
		// p wave
		} else if(this.isActive[1]) {
			value = derivationCfg.pWave.fnc( this.activePartCompletion );
			this.activePartCompletion += derivationCfg.pWave.duration() * timeMult;
		} else {
			this.isActive = [true,false,false,false,false,false,false,false,false,false];
			this.activePartCompletion = 0;
		}
		// negate value because coord system has the center on top, not bottom
		return -value * amp;
	}

	/**
	 * Continues to the next moment/frame
	 */
	next() {
		this.time += parseInt(this.state().statusBar.speed / 25);
	}


}