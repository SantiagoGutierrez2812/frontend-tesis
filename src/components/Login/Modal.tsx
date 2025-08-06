import "./Modal.css"; 

interface ModalProps {
  children: React.ReactNode;
  cerrar: () => void;
}

export default function Modal({ children, cerrar }: ModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button onClick={cerrar} className="modal-close">X</button>
        {children}
      </div>
    </div>
  );
}
