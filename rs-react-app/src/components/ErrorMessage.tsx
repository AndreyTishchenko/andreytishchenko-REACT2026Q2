interface ErrorMessageProps {
  readonly message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <div className="error-message">{message}</div>;
}
