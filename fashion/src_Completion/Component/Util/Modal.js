import '../../CSS/Modal.css';
// components/Modal.js
const Modal = ({ message, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose}>확인</button>
      </div>
    </div>
  );
  
  export default Modal;
  