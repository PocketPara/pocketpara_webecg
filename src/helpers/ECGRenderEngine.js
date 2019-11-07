import ECGGenerator from "./ECGGenerator";

/**
 * Handles drawing on the ecg
 */
export default class ECGRenderEngine {

	constructor(state) {
		// Keep access to the state
		this.ecgstate = state;
		/** Returns the current ecg state */
		this.state = ()=>{ return state.getState(); };

		// The generator of the ecg
		this.generator = new ECGGenerator(state);

		// All values of the current ecg (equals the amount of pixels of a derivation's width)
		this.values = [
			[],[],[],						// I, II, III
			[],[],[],						// aVL, aVR, aVF
			[],[],[],[],[],[]		// V1 - V6
		];
		// The position of the ruler
		this.rulerPosition = 0;

		// Variables needed for rendering
		this.variables = {};

		// Get the canvas objects and the context references
		this.canvas = document.getElementById('mainCanvas');
		// The shadow canvas is used for drawing persistent objects that don't change
		// when a new frame is created
		this.shadowCanvas = document.getElementById('shadowCanvas');
		
		// Make the canvas fit the page
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight - 80;
		this.shadowCanvas.width = window.innerWidth;
		this.shadowCanvas.height = window.innerHeight - 80;

		// Create the context
		this.ctx = this.canvas.getContext('2d');
		this.shadowCtx = this.shadowCanvas.getContext('2d');

		// (may remove the lines below)
		this.computeVariables();

		this._renderWireFrames();
		this.renderPersistentObjects();

		// Subscribe to changes of isPlaying
		this.ecgstate.subscribe( (newState, updatedProps) => {
			if(newState.isPlaying) {
				// Draw the first frame
				this.renderFrame();
			}
		}, 'isPlaying', true);

	}

	/**
	 * Renders a new frame
	 */
	renderFrame() {
		// Context
		let ctx = this.ctx;

		// Define style
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.lineCap = 'rounded';

		// Clear old frame
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Render all the values
		// for each row and col (all derivations)
		for(let col = 0; col <= 1; col++) {
			for(let row = 0; row <= 5; row++) {
				// The values of the current derivation
				const data = this.values[col * 6 + row];
				const startX = this.variables.col[col];
				const startY = this.variables.row[row] + this.variables.derivation.hHalf;

				ctx.beginPath();
				ctx.moveTo(
					startX,
					startY + data[0]
				);

				// For each pixel
				for(let x = 1; x < data.length; x++) {
					ctx.lineTo(
						startX + x,
						startY + data[x]
					);
				}

				ctx.stroke();
				ctx.closePath();

			}
		}

		for(let i =0; i < this.values.length; i++) {
			// Set the new value
			this.values[i][this.rulerPosition] = this.generator.getValue(i);
		}

		// Draw (clear) both rulers
		ctx.clearRect( this.variables.col[0] + this.rulerPosition+1, 0, this.state().ecgDisplay.rulerWidth, this.canvas.height );
		ctx.clearRect( this.variables.col[1] + this.rulerPosition+1, 0, this.state().ecgDisplay.rulerWidth, this.canvas.height );

		this.rulerPosition++;
		this.rulerPosition %= this.variables.derivation.width;

		// Tell generator that time has passed
		this.generator.next();

		// If still running, request next frame
		if(this.state().isPlaying) {
			window.requestAnimationFrame(()=>{
				this.renderFrame();
			});
		}

	}

	/**
	 * Computes all variables needed to draw on the canvas
	 * (for example, the positions of each derivation)
	 */
	computeVariables() {
		let variables = {};

		// Compute the width and height of a derivation
		variables.derivation = {
			width: parseInt( (this.canvas.width - 4 * this.state().ecgDisplay.horizontalMargin)/2 ),
			height: parseInt( (this.canvas.height - 2 * this.state().ecgDisplay.verticalMargin)/6)
		};
		// Define hHalf
		variables.derivation.hHalf = parseInt(variables.derivation.height/2);

		// Define columns
		variables.col = [
			this.state().ecgDisplay.horizontalMargin,
			this.state().ecgDisplay.horizontalMargin*3 + variables.derivation.width
		];

		// Define rows
		variables.row = [];
		for(let i =0; i <= 5; i++) {
			variables.row.push( this.state().ecgDisplay.verticalMargin + i * variables.derivation.height );
		}

		// Define default values (0, for each derivation)
		for(let i = 0; i < this.values.length; i++) {
			for(let px = 0; px < variables.derivation.width; px++) {
				this.values[i].push(0);
			}
		}

		this.variables = variables;
	}

	/**
	 * Development function to draw wireframes
	 */
	_renderWireFrames() {
		let ctx = this.shadowCtx;

		ctx.fillStyle = 'rgba(75, 241, 228, 0.2)';
		// Draw boxes for the derivations
		for(let col = 0; col <= 1; col++) {
			for(let row = 0; row <= 5; row++) {
				// draw the fields with a border
				ctx.fillRect(
					2 + (this.state().ecgDisplay.horizontalMargin + ((col===1) ? this.state().ecgDisplay.horizontalMargin*2+this.variables.derivation.width : 0)),
					2 + (this.state().ecgDisplay.verticalMargin + row * this.variables.derivation.height),
					this.variables.derivation.width-4,
					this.variables.derivation.height-4
				);
			}
		}
	}

	/**
	 * Renders all persistent objects of the shadow canvas
	 * for example Lead descriptions etc.
	 */
	renderPersistentObjects() {
		// Draw derivation descriptions
		//font-family: 'Space Mono', monospace;
		let ctx = this.shadowCtx;

		ctx.font = 'bold 15pt Space Mono, Monaco, Consolas';
		ctx.fillStyle = '#000000';
		ctx.textAlign = 'right';

		// Draw titles of the derivations (I-III, aVL, aVR, aVL, V1-V6)
		for(let col = 0; col <= 1; col++) {
			for(let row = 0; row <= 5; row++) {
				ctx.fillText(
					this.state().ecgDisplay.derivationNames[6*col + row],
					this.variables.col[col] - 5,
					this.variables.row[row] + this.variables.derivation.hHalf
				);
			}
		}


	}



}