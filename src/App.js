import React from 'react';
import TopNav from './components/TopNav';
import StatusBar from './components/StatusBar';
import EcgPanel from './components/EcgPanel';
import ECGState from './helpers/ECGState';

class App extends React.Component {

  state = {
    ecgState: new ECGState()
  }

  render() {
    return <div>
      <TopNav ecgState={this.state.ecgState} />
      
      <EcgPanel ecgState={this.state.ecgState} />

      <StatusBar ecgState={this.state.ecgState} />
    </div>;
  }


}

export default App;
