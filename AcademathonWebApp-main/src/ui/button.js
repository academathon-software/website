import './button.css'; // Import CSS for styling

function Button({ text, onClick, type}) {
  return (
    <button className="button" type={type} onClick={onClick}>{text}</button>
  );
}

export default Button;