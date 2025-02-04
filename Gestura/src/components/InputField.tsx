import React from 'react';

interface InputFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className:string;
}

const InputField: React.FC<InputFieldProps> = ({ type, placeholder, value, onChange,className }) => {
  return (
    <div className="input-field">
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} className={className} />
    </div>
  );
};

export default InputField;
