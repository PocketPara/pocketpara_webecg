import React from 'react';
import './EcgPanel.scss';
import ECGRenderEngine from '../helpers/ECGRenderEngine';

/**
 * The component that contains the two main ecg's that the user interacts with
 */
export default class EcgPanel extends React.Component {

	componentDidMount() {
		this.renderEngine = new ECGRenderEngine(this.props.ecgState);
	}


	render() {
		return <div>
			<canvas className="mainCanvas" id="mainCanvas">
				Sorry, but your Browser doesn't support HTML5.
			</canvas>
			<canvas className="shadowCanvas" id="shadowCanvas">
			</canvas>
		</div>;
	}

}