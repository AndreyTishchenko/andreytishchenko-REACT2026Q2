import { Component } from 'react';

interface ErrorMessageProps {
  readonly message: string;
}

export class ErrorMessage extends Component<ErrorMessageProps> {
  render() {
    return <div className="error-message">{this.props.message}</div>;
  }
}
