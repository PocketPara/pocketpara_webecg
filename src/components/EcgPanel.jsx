import React from 'react';
import './EcgPanel.scss';

export default class EcgPanel extends React.Component {
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