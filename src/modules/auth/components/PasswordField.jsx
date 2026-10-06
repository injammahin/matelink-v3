import {
  useState,
} from 'react';

import {
  Eye,
  EyeOff,
  LockKeyhole,
} from 'lucide-react';

import {
  Input,
} from '@/shared/components/ui/input';

import {
  Label,
} from '@/shared/components/ui/label';


export default function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = 'Enter your password',
  autoComplete,
  error,
}) {
  const [
    visible,
    setVisible,
  ] =
    useState(false);


  return (
    <div>

      <Label
        htmlFor={id}
        className="auth-label"
      >
        {label}
      </Label>


      <div className="auth-input-wrap">

        <LockKeyhole
          className="auth-input-icon"
          size={17}
        />


        <Input
          id={id}
          type={
            visible
              ? 'text'
              : 'password'
          }
          value={value}
          onChange={onChange}
          autoComplete={
            autoComplete
          }
          placeholder={
            placeholder
          }
          aria-invalid={
            Boolean(error)
          }
          className="auth-input auth-input-password"
        />


        <button
          type="button"
          className="auth-password-toggle"
          onClick={() =>
            setVisible(
              (
                current
              ) =>
                !current
            )
          }
          aria-label={
            visible
              ? 'Hide password'
              : 'Show password'
          }
        >
          {visible ? (
            <EyeOff
              size={17}
            />
          ) : (
            <Eye
              size={17}
            />
          )}
        </button>

      </div>


      {error && (
        <p className="field-error auth-field-error">
          {error}
        </p>
      )}

    </div>
  );
}