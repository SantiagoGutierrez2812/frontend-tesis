import React from 'react';
import './Modal.css';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}