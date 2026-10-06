import {
  Link,
} from 'react-router-dom';

import {
  ShieldCheck,
  Sparkles,
} from 'lucide-react';


export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  wide = false,
}) {
  return (
    <section className="auth-page">

      <div
        className="auth-page-glow auth-page-glow-one"
        aria-hidden="true"
      />

      <div
        className="auth-page-glow auth-page-glow-two"
        aria-hidden="true"
      />


      <div className="container-site auth-page-container">

        <div
          className={`auth-panel ${
            wide
              ? 'auth-panel-wide'
              : ''
          }`}
        >

          <div
            className="auth-panel-topline"
            aria-hidden="true"
          />


          <div className="auth-panel-heading">

            <div className="auth-security-chip">
              <ShieldCheck
                size={15}
              />

              Secure customer access
            </div>


            <div
              className="auth-mark"
              aria-hidden="true"
            >
              <Sparkles
                size={19}
              />
            </div>


            <p className="auth-eyebrow">
              {eyebrow}
            </p>


            <h1 className="auth-title">
              {title}
            </h1>


            <p className="auth-description">
              {description}
            </p>

          </div>


          {children}


          <div className="auth-panel-footer">

            <ShieldCheck
              size={14}
            />

            <span>
              Your details are sent securely to Matelink.
            </span>

            <span
              className="auth-footer-dot"
              aria-hidden="true"
            />

            <Link to="/privacy">
              Privacy
            </Link>

          </div>

        </div>

      </div>

    </section>
  );
}