import { Component } from 'react';

interface ErrorTriggerState {
  readonly shouldThrow: boolean;
}

export class ErrorTrigger extends Component<object, ErrorTriggerState> {
  state: ErrorTriggerState = {
    shouldThrow: false,
  };

  private simulateError = (): void => {
    this.setState({ shouldThrow: true });
  };

  render() {
    if (this.state.shouldThrow) {
      throw new Error('Simulated application error from the test button.');
    }

    return (
      <button className="danger-button" type="button" onClick={this.simulateError}>
        Simulate app error
      </button>
    );
  }
}
