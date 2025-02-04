import React from 'react';
import './CustomButton.css';

interface ButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}

const CustomButton: React.FC<ButtonProps> = ({ text, onClick,className }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {text}
    </button>
  );
};

export default CustomButton;
