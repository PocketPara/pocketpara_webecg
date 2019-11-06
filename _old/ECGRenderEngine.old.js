export default class ECGRenderEngine {

	constructor(ecgState) {
		this.frames = 0;
		this.time = 0;
		this.lastcalledtime=null;
		this.fps=0;
		this.currentValues = [
			0,0,0,
			0,0,0,
			0,0,0,0
		];

		this.ecgState = ecgState;
		this.canvas = document.getElementById('mainCanvas');
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight - 80;
		this.shadowCanvas = document.getElementById('shadowCanvas');
		this.shadowCanvas.width = window.innerWidth;
		this.shadowCanvas.height = window.innerHeight - 80;

		this.subscription = ecgState.subscribe( (state, propUpdate) => {
			this.computeVariables(this.canvas);
			this.renderOverlay(state.ecgRuntimeVariables);
		}, ['statusBar', 'ecgDisplay'], true);

		ecgState.subscribe( (state, propUpdate) => {
			this.renderFrame();
		}, ['isPlaying'], );


		setInterval(() => {
			this.ecgState.setState({ fps: this.fps });
		}, 100);
	}


	/**
	 * Calculates variables, offsets ect
	 */
	computeVariables = (canvas) => {
		let variables = {};
		const displayType = this.ecgState.getState().statusBar.displayType;
		const displayOptions = this.ecgState.getState().ecgDisplay;
		// If its a valid ecg format
		if(displayType >= 0) {

			// 4-lead
			if(displayType === 0) {
				variables.derivationWidth = parseInt((canvas.width-2 * displayOptions.horizontalPadding) );
			// 12-lead
			} else if (displayType === 1) {
				variables.derivationWidth = parseInt((canvas.width-(4 * displayOptions.horizontalPadding))/2 );
			}
			
			// The size of a derivation (window width/height minus all margins)
			
			variables.derivationHeight = parseInt((canvas.height-(2 * displayOptions.verticalPadding))/6 );

			// The vertical columns
			variables.columns = [
				displayOptions.horizontalPadding,
				variables.derivationWidth + 3 * displayOptions.horizontalPadding
			];

			// The horizontal columns
			variables.rows = [
				displayOptions.verticalPadding,
				displayOptions.verticalPadding + 1 * variables.derivationHeight,
				displayOptions.verticalPadding + 2 * variables.derivationHeight,
				displayOptions.verticalPadding + 3 * variables.derivationHeight,
				displayOptions.verticalPadding + 4 * variables.derivationHeight,
				displayOptions.verticalPadding + 5 * variables.derivationHeight
			];

			variables.rowCenter = [];
			// rowcenter....
			for(let row of variables.rows) {
				variables.rowCenter.push(parseInt(row + variables.derivationHeight/2))
			}

		}
		// Set state
		this.ecgState.setState({
			ecgRuntimeVariables: variables
		});

	}

	renderOverlay = (variables) => {
		let ctx = this.shadowCanvas.getContext('2d');
		const displayType = this.ecgState.getState().statusBar.displayType;
		const displayOptions = this.ecgState.getState().ecgDisplay;

		ctx.clearRect(0,0,this.shadowCanvas.width, this.shadowCanvas.height);
		// Draw descriptions
		ctx.font = 'bold 20px Consolas';
		ctx.fillStyle = '#232323';

		// any valid ecg
		if(displayType >= 0) {
			// draw the limb leads
			ctx.fillText(
				displayOptions.derivationNames[0], 
				variables.columns[0], 
				variables.rowCenter[0] + displayOptions.textVerticalOffset
			);

			ctx.fillText(
				displayOptions.derivationNames[1], 
				variables.columns[0], 
				variables.rowCenter[1] + displayOptions.textVerticalOffset
			);

			ctx.fillText(
				displayOptions.derivationNames[2], 
				variables.columns[0], 
				variables.rowCenter[2] + displayOptions.textVerticalOffset
			);

			ctx.fillText(
				displayOptions.derivationNames[3], 
				variables.columns[0], 
				variables.rowCenter[3] + displayOptions.textVerticalOffset
			);

			ctx.fillText(
				displayOptions.derivationNames[4], 
				variables.columns[0], 
				variables.rowCenter[4] + displayOptions.textVerticalOffset
			);

			ctx.fillText(
				displayOptions.derivationNames[5], 
				variables.columns[0], 
				variables.rowCenter[5] + displayOptions.textVerticalOffset
			);


			// if 12-lead, draw the V1-V6 too
			if(displayType === 1) {
				ctx.fillText(
					displayOptions.derivationNames[6], 
					variables.columns[1], 
					variables.rowCenter[0] + displayOptions.textVerticalOffset
				);

				ctx.fillText(
					displayOptions.derivationNames[7], 
					variables.columns[1], 
					variables.rowCenter[1] + displayOptions.textVerticalOffset
				);

				ctx.fillText(
					displayOptions.derivationNames[8], 
					variables.columns[1], 
					variables.rowCenter[2] + displayOptions.textVerticalOffset
				);

				ctx.fillText(
					displayOptions.derivationNames[9], 
					variables.columns[1], 
					variables.rowCenter[3] + displayOptions.textVerticalOffset
				);

				ctx.fillText(
					displayOptions.derivationNames[10], 
					variables.columns[1], 
					variables.rowCenter[4] + displayOptions.textVerticalOffset
				);

				ctx.fillText(
					displayOptions.derivationNames[11], 
					variables.columns[1], 
					variables.rowCenter[5] + displayOptions.textVerticalOffset
				);

			}
		}
	};

	/**
	 * Renders a new frame on the canvas, 
	 * and calls itself again if active in state (isPlaying)
	 */
	renderFrame() {
		let ctx = this.canvas.getContext('2d');
		const displayType = this.ecgState.getState().statusBar.displayType;
		const displayOptions = this.ecgState.getState().ecgDisplay;
		const variables = this.ecgState.getState().ecgRuntimeVariables;
		const rulerPosition = (this.frames % variables.derivationWidth) + displayOptions.horizontalPadding;
		const deltaTime = (this.fps / 60) * this.ecgState._state.statusBar.speed;
		this.time += deltaTime;


		ctx.strokeStyle = '#565656';
		ctx.lineCap = 'rounded';
		ctx.lineWidth = 1;
		// Draw next pixel
		// draw limb leads always
		for(let col = 0; col <= ((displayType===1) ? 1 : 0); col++) {
			for(let row = 0; row <= 5; row++) {
				const oldY = this.currentValues[ 5*col + row ];
				const newY = Math.sin(this.time/5000)*75;
				ctx.beginPath();
				ctx.moveTo(
					variables.columns[col] + rulerPosition - 1,
					variables.rowCenter[ row ] + oldY
				);
				ctx.lineTo(
					variables.columns[col] + rulerPosition - 2,
					variables.rowCenter[ row ] + newY
				);
				ctx.stroke();
				ctx.closePath();
				this.currentValues[5*col + row] = newY;
			}
		}

		// Calculate next position


		// Clear with rulers

		// Clear with first ruler
		ctx.clearRect( 
			variables.columns[0] + rulerPosition,
			0,
			displayOptions.rulerWidth,
			this.canvas.height
		);
		// if there is a second column, draw that ruler too
		if( displayType > 0) {
			ctx.clearRect( 
				variables.columns[1] + rulerPosition,
				0,
				displayOptions.rulerWidth,
				this.canvas.height
			);
		}
		


		if(!this.lastcalledtime) {
			this.lastcalledtime = performance.now();
			this.fps = 0;
		}
		this.deltaTime = (performance.now() - this.lastcalledtime)/1000;
		this.lastcalledtime = performance.now();
		this.fps = parseInt(1/this.deltaTime);
		
		this.frames++;
		if(this.ecgState.getState().isPlaying) {
			window.requestAnimationFrame( ()=>{
				this.renderFrame();
			});
		}
	}

}