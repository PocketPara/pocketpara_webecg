import React from 'react';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
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

      <BottomNav ecgState={this.state.ecgState} />
    </div>;
  }


}

export default App;
