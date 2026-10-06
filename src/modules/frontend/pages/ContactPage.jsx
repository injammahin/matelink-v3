import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import {
  useApp,
} from '@/shared/context/AppContext';

/*
|--------------------------------------------------------------------------
| CONTACT PAGE
|--------------------------------------------------------------------------
|
| File:
| src/modules/frontend/pages/ContactPage.jsx
|
| Cloudflare Turnstile:
| - Local development falls back to Cloudflare's official always-pass
|   test sitekey.
| - Production should set VITE_TURNSTILE_SITE_KEY.
| - IMPORTANT: real protection requires the Laravel/API backend to verify
|   the Turnstile token with Cloudflare Siteverify before saving/sending.
|
*/

const TURNSTILE_SCRIPT_ID =
  'matelink-cloudflare-turnstile';

const CLOUDFLARE_TURNSTILE_SCRIPT =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const CLOUDFLARE_TEST_SITE_KEY =
  '1x00000000000000000000AA';

const CONTACT_DEMO_STORAGE_KEY =
  'matelink.contact.demo.v1';

const DEFAULT_ADDRESS =
  'Elizabeth Street, Surry Hills, NSW 2010, Australia';

function getTurnstileSiteKey() {
  const configured =
    import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();

  if (configured) {
    return configured;
  }

  /*
   * Official Cloudflare test sitekey.
   * Always passes and works on localhost.
   * DO NOT use this key in production.
   */
  if (import.meta.env.DEV) {
    return CLOUDFLARE_TEST_SITE_KEY;
  }

  return '';
}

function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  resetSignal,
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  const siteKey = getTurnstileSiteKey();

  useEffect(() => {
    let cancelled = false;

    function renderWidget() {
      if (
        cancelled ||
        !containerRef.current ||
        !window.turnstile ||
        widgetIdRef.current !== null ||
        !siteKey
      ) {
        return;
      }

      try {
        widgetIdRef.current =
          window.turnstile.render(
            containerRef.current,
            {
              sitekey: siteKey,

              theme: 'light',

              action:
                'contact_form',

              callback(token) {
                onVerify(token);
              },

              'expired-callback'() {
                onExpire();
              },

              'error-callback'() {
                onError();
              },
            }
          );
      } catch (error) {
        console.error(
          'Turnstile render failed:',
          error
        );

        onError();
      }
    }

    if (window.turnstile) {
      renderWidget();

      return () => {
        cancelled = true;
      };
    }

    let script =
      document.getElementById(
        TURNSTILE_SCRIPT_ID
      );

    if (!script) {
      script =
        document.createElement(
          'script'
        );

      script.id =
        TURNSTILE_SCRIPT_ID;

      script.src =
        CLOUDFLARE_TURNSTILE_SCRIPT;

      script.async = true;
      script.defer = true;

      document.head.appendChild(
        script
      );
    }

    script.addEventListener(
      'load',
      renderWidget
    );

    return () => {
      cancelled = true;

      script?.removeEventListener(
        'load',
        renderWidget
      );
    };
  }, [
    siteKey,
    onVerify,
    onExpire,
    onError,
  ]);

  useEffect(() => {
    if (
      resetSignal > 0 &&
      widgetIdRef.current !== null &&
      window.turnstile
    ) {
      try {
        window.turnstile.reset(
          widgetIdRef.current
        );
      } catch {
        /*
         * Safe no-op if Turnstile has
         * already disposed the widget.
         */
      }
    }
  }, [resetSignal]);

  useEffect(() => {
    return () => {
      if (
        widgetIdRef.current !== null &&
        window.turnstile
      ) {
        try {
          window.turnstile.remove(
            widgetIdRef.current
          );
        } catch {
          /*
           * Safe no-op during route
           * unmount.
           */
        }
      }
    };
  }, []);

  if (!siteKey) {
    return (
      <div
        className="
          rounded-xl
          border
          border-amber-200
          bg-amber-50
          px-4
          py-3
          text-xs
          leading-5
          text-amber-800
        "
      >
        Cloudflare Turnstile is not
        configured. Add
        {' '}
        <code>
          VITE_TURNSTILE_SITE_KEY
        </code>
        {' '}
        before using this form in
        production.
      </div>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="
          min-h-[65px]
          overflow-hidden
        "
      />

      {import.meta.env.DEV &&
      siteKey ===
        CLOUDFLARE_TEST_SITE_KEY ? (
        <p
          className="
            mt-2
            text-[10px]
            leading-4
            text-muted-foreground
          "
        >
          Local development is using
          Cloudflare&apos;s official
          always-pass Turnstile test
          sitekey.
        </p>
      ) : null}
    </div>
  );
}

function ContactMethod({
  icon: Icon,
  eyebrow,
  title,
  description,
  href,
  external = false,
}) {
  const content = (
    <>
      <div
        className="
          grid
          h-11
          w-11
          shrink-0
          place-items-center
          rounded-xl
          bg-[#edf6f5]
          text-[#087e83]
        "
      >
        <Icon size={19} />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-[#087e83]
          "
        >
          {eyebrow}
        </p>

        <p
          className="
            mt-1
            break-words
            text-sm
            font-semibold
            text-[#102d43]
          "
        >
          {title}
        </p>

        {description ? (
          <p
            className="
              mt-1
              text-xs
              leading-5
              text-muted-foreground
            "
          >
            {description}
          </p>
        ) : null}
      </div>

      {href ? (
        <ArrowRight
          size={16}
          className="
            mt-1
            shrink-0
            text-muted-foreground
            transition
            group-hover:translate-x-0.5
            group-hover:text-[#087e83]
          "
        />
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div
        className="
          flex
          items-start
          gap-4
          rounded-2xl
          border
          border-border/80
          bg-white
          p-4
        "
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target={
        external
          ? '_blank'
          : undefined
      }
      rel={
        external
          ? 'noopener noreferrer'
          : undefined
      }
      className="
        group
        flex
        items-start
        gap-4
        rounded-2xl
        border
        border-border/80
        bg-white
        p-4
        transition
        hover:-translate-y-0.5
        hover:border-[#087e83]/25
        hover:shadow-[0_14px_34px_rgba(16,45,67,0.07)]
      "
    >
      {content}
    </a>
  );
}

function FormInput({
  label,
  required = false,
  error,
  ...props
}) {
  return (
    <label
      className="
        block
      "
    >
      <span
        className="
          mb-2
          block
          text-xs
          font-semibold
          text-[#102d43]
        "
      >
        {label}

        {required ? (
          <span
            className="
              ml-1
              text-[#087e83]
            "
          >
            *
          </span>
        ) : null}
      </span>

      <input
        {...props}
        className={`
          h-12
          w-full
          rounded-xl
          border
          bg-white
          px-4
          text-sm
          text-[#102d43]
          outline-none
          transition

          placeholder:text-slate-400

          focus:border-[#087e83]/50
          focus:ring-4
          focus:ring-[#087e83]/[0.07]

          ${
            error
              ? 'border-red-300'
              : 'border-border'
          }
        `}
      />

      {error ? (
        <span
          className="
            mt-1.5
            block
            text-[11px]
            text-red-600
          "
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

function saveDemoContact(payload) {
  let existing = [];

  try {
    existing =
      JSON.parse(
        localStorage.getItem(
          CONTACT_DEMO_STORAGE_KEY
        ) || '[]'
      );

    if (!Array.isArray(existing)) {
      existing = [];
    }
  } catch {
    existing = [];
  }

  existing.unshift({
    ...payload,

    id:
      crypto.randomUUID?.() ||
      `contact-${Date.now()}`,

    status: 'new',

    createdAt:
      new Date().toISOString(),
  });

  localStorage.setItem(
    CONTACT_DEMO_STORAGE_KEY,
    JSON.stringify(existing)
  );
}

export default function ContactPage() {
  const app = useApp();

  const settings =
    app?.settings || {};

  const [values, setValues] =
    useState({
      name: '',
      email: '',
      mobile: '',
      topic:
        'General enquiry',
      message: '',

      /*
       * Honeypot.
       * Real users never see this.
       */
      website: '',
    });

  const [errors, setErrors] =
    useState({});

  const [turnstileToken, setTurnstileToken] =
    useState('');

  const [turnstileError, setTurnstileError] =
    useState('');

  const [resetTurnstile, setResetTurnstile] =
    useState(0);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const formStartedAtRef =
    useRef(Date.now());

  const contactEmail =
    settings.contactEmail ||
    settings.email ||
    '';

  const phone =
    settings.showPhone === false
      ? ''
      : settings.phone || '';

  const officeAddress =
    settings.address ||
    settings.officeAddress ||
    DEFAULT_ADDRESS;

  const instagram =
    settings.instagram || '';

  const facebook =
    settings.facebook || '';

  const mapQuery =
    encodeURIComponent(
      officeAddress
    );

  const mapEmbedUrl =
    `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  const mapOpenUrl =
    `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const canSubmit =
    Boolean(turnstileToken) &&
    !submitting;

  const submitFromApp =
    app?.addContact ||
    app?.createContact ||
    app?.submitContact ||
    null;

  const apiEndpoint =
    import.meta.env
      .VITE_CONTACT_ENDPOINT?.trim() ||
    '';

  const details = useMemo(
    () => [
      {
        icon: Mail,
        eyebrow: 'Email',
        title:
          contactEmail ||
          'Send us a message',
        description:
          contactEmail
            ? 'For bookings, quotes and general enquiries.'
            : 'Use the secure form and our team will respond.',
        href:
          contactEmail
            ? `mailto:${contactEmail}`
            : '#contact-form',
      },

      {
        icon: Phone,
        eyebrow: 'Phone',
        title:
          phone ||
          'Phone support',
        description:
          phone
            ? 'Call during business hours.'
            : 'Phone details can be managed from website settings.',
        href:
          phone
            ? `tel:${phone.replace(/\s+/g, '')}`
            : null,
      },

      {
        icon: MapPin,
        eyebrow: 'Location',
        title:
          officeAddress,
        description:
          'Serving homes across Sydney.',
        href:
          mapOpenUrl,
        external: true,
      },
    ],
    [
      contactEmail,
      phone,
      officeAddress,
      mapOpenUrl,
    ]
  );

  function patch(patchValue) {
    setValues(previous => ({
      ...previous,
      ...patchValue,
    }));
  }

  function validate() {
    const found = {};

    if (
      values.name
        .trim()
        .length < 2
    ) {
      found.name =
        'Please enter your name.';
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.email.trim()
      )
    ) {
      found.email =
        'Enter a valid email address.';
    }

    if (
      values.message
        .trim()
        .length < 10
    ) {
      found.message =
        'Please add a little more detail.';
    }

    setErrors(found);

    return (
      Object.keys(found).length === 0
    );
  }

  async function submit(event) {
    event.preventDefault();

    setSubmitted(false);

    /*
     * Honeypot detection.
     */
    if (values.website) {
      return;
    }

    /*
     * Very-fast-submit trap.
     * This is only an extra frontend
     * signal, not a security boundary.
     */
    if (
      Date.now() -
        formStartedAtRef.current <
      1500
    ) {
      setErrors({
        form:
          'Please wait a moment and try again.',
      });

      return;
    }

    if (!validate()) {
      return;
    }

    if (!turnstileToken) {
      setTurnstileError(
        'Please complete the Cloudflare security check.'
      );

      return;
    }

    setSubmitting(true);
    setTurnstileError('');

    const payload = {
      name:
        values.name.trim(),

      email:
        values.email.trim(),

      mobile:
        values.mobile.trim(),

      topic:
        values.topic,

      message:
        values.message.trim(),

      /*
       * Send this token to Laravel.
       * Laravel MUST verify it with
       * Cloudflare Siteverify.
       */
      turnstile_token:
        turnstileToken,
    };

    try {
      if (apiEndpoint) {
        const response =
          await fetch(
            apiEndpoint,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Accept:
                  'application/json',
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        if (!response.ok) {
          const result =
            await response
              .json()
              .catch(() => ({}));

          throw new Error(
            result.message ||
              'We could not send your message.'
          );
        }
      } else if (
        typeof submitFromApp ===
        'function'
      ) {
        await Promise.resolve(
          submitFromApp({
            ...payload,

            /*
             * Context/local demo stores
             * do not need the raw token.
             */
            turnstileVerified:
              true,
          })
        );
      } else {
        /*
         * Frontend-only fallback for
         * the current demo project.
         */
        saveDemoContact({
          name:
            payload.name,

          email:
            payload.email,

          mobile:
            payload.mobile,

          topic:
            payload.topic,

          message:
            payload.message,

          turnstileVerified:
            true,
        });
      }

      setSubmitted(true);

      setValues({
        name: '',
        email: '',
        mobile: '',
        topic:
          'General enquiry',
        message: '',
        website: '',
      });

      setErrors({});

      setTurnstileToken('');

      setResetTurnstile(
        previous =>
          previous + 1
      );

      formStartedAtRef.current =
        Date.now();
    } catch (error) {
      setErrors({
        form:
          error?.message ||
          'Something went wrong. Please try again.',
      });

      /*
       * Turnstile tokens are
       * single-use server-side.
       * Reset after a failed attempt.
       */
      setTurnstileToken('');

      setResetTurnstile(
        previous =>
          previous + 1
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="
        bg-[#f7f6f2]
        text-[#102d43]
      "
    >
      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="
          border-b
          border-border/70
        "
      >
        <div
          className="
            container-site
            grid
            gap-8
            py-12
            lg:grid-cols-[1.05fr_.95fr]
            lg:items-end
            lg:py-16
          "
        >
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#087e83]/15
                bg-[#edf6f5]
                px-3
                py-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.13em]
                text-[#087e83]
              "
            >
              <MessageCircle
                size={13}
              />

              Contact Matelink
            </div>

            <h1
              className="
                mt-5
                max-w-3xl
                text-4xl
                font-semibold
                tracking-[-0.055em]
                sm:text-5xl
                lg:text-[3.6rem]
                lg:leading-[1.02]
              "
            >
              A simple way to get in
              touch.
            </h1>

            <p
              className="
                mt-5
                max-w-2xl
                text-base
                leading-8
                text-muted-foreground
                sm:text-lg
              "
            >
              Questions about a clean,
              an existing booking or a
              custom requirement? Send
              us a message and the
              Matelink team will point
              you in the right
              direction.
            </p>

            <div
              className="
                mt-7
                flex
                flex-wrap
                gap-3
              "
            >
              <Link
                to="/book"
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#087e83]
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#066e72]
                "
              >
                Book a clean

                <ArrowRight
                  size={15}
                />
              </Link>

              <Link
                to="/get-a-quote"
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-border
                  bg-white
                  px-5
                  text-sm
                  font-semibold
                  text-[#102d43]
                  transition
                  hover:bg-[#fafafa]
                "
              >
                Get a tailored quote
              </Link>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >
            {[
              [
                ShieldCheck,
                'Protected form',
                'Cloudflare Turnstile',
              ],

              [
                Clock3,
                'Quick response',
                'We review every enquiry',
              ],

              [
                MapPin,
                'Sydney based',
                'Local cleaning support',
              ],

              [
                CalendarCheck2,
                'Already booked?',
                'Include your booking reference',
              ],
            ].map(
              ([
                Icon,
                title,
                note,
              ]) => (
                <div
                  key={title}
                  className="
                    rounded-2xl
                    border
                    border-border/80
                    bg-white
                    p-4
                    shadow-[0_10px_28px_rgba(16,45,67,0.04)]
                  "
                >
                  <div
                    className="
                      grid
                      h-9
                      w-9
                      place-items-center
                      rounded-xl
                      bg-[#edf6f5]
                      text-[#087e83]
                    "
                  >
                    <Icon
                      size={16}
                    />
                  </div>

                  <p
                    className="
                      mt-4
                      text-sm
                      font-semibold
                    "
                  >
                    {title}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      leading-5
                      text-muted-foreground
                    "
                  >
                    {note}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT DETAILS
      ====================================================== */}

      <section
        className="
          container-site
          py-8
          lg:py-10
        "
      >
        <div
          className="
            grid
            gap-3
            md:grid-cols-3
          "
        >
          {details.map(
            item => (
              <ContactMethod
                key={item.eyebrow}
                {...item}
              />
            )
          )}
        </div>
      </section>

      {/* =====================================================
          FORM + SUPPORT
      ====================================================== */}

      <section
        className="
          container-site
          pb-12
          lg:pb-16
        "
      >
        <div
          className="
            grid
            gap-6
            lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,.9fr)]
          "
        >
          <form
            id="contact-form"
            onSubmit={submit}
            noValidate
            className="
              rounded-[24px]
              border
              border-border/80
              bg-white
              p-5
              shadow-[0_18px_50px_rgba(16,45,67,0.055)]
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-5
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.13em]
                    text-[#087e83]
                  "
                >
                  Send a message
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-semibold
                    tracking-[-0.04em]
                  "
                >
                  How can we help?
                </h2>

                <p
                  className="
                    mt-2
                    max-w-xl
                    text-sm
                    leading-6
                    text-muted-foreground
                  "
                >
                  Share the essentials
                  below. Please do not
                  send payment details or
                  other sensitive
                  information through
                  this form.
                </p>
              </div>

              <div
                className="
                  hidden
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-xl
                  bg-[#edf6f5]
                  text-[#087e83]
                  sm:grid
                "
              >
                <Send size={18} />
              </div>
            </div>

            {/* Honeypot */}
            <div
              aria-hidden="true"
              className="
                absolute
                left-[-9999px]
                top-auto
                h-px
                w-px
                overflow-hidden
              "
            >
              <label>
                Website

                <input
                  type="text"
                  name="website"
                  autoComplete="off"
                  tabIndex={-1}
                  value={values.website}
                  onChange={event =>
                    patch({
                      website:
                        event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div
              className="
                mt-7
                grid
                gap-5
                sm:grid-cols-2
              "
            >
              <FormInput
                label="Full name"
                required
                autoComplete="name"
                placeholder="Your name"
                value={values.name}
                error={errors.name}
                onChange={event =>
                  patch({
                    name:
                      event.target.value,
                  })
                }
              />

              <FormInput
                label="Email"
                required
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                error={errors.email}
                onChange={event =>
                  patch({
                    email:
                      event.target.value,
                  })
                }
              />

              <FormInput
                label="Mobile"
                type="tel"
                autoComplete="tel"
                placeholder="04xx xxx xxx"
                value={values.mobile}
                onChange={event =>
                  patch({
                    mobile:
                      event.target.value,
                  })
                }
              />

              <label
                className="
                  block
                "
              >
                <span
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-[#102d43]
                  "
                >
                  What is this about?
                </span>

                <select
                  value={values.topic}
                  onChange={event =>
                    patch({
                      topic:
                        event.target.value,
                    })
                  }
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-border
                    bg-white
                    px-4
                    text-sm
                    text-[#102d43]
                    outline-none
                    transition

                    focus:border-[#087e83]/50
                    focus:ring-4
                    focus:ring-[#087e83]/[0.07]
                  "
                >
                  <option>
                    General enquiry
                  </option>

                  <option>
                    Booking support
                  </option>

                  <option>
                    Existing booking
                  </option>

                  <option>
                    End-of-Lease / Bond Back Guarantee
                  </option>

                  <option>
                    Re-clean support
                  </option>

                  <option>
                    Quote question
                  </option>

                  <option>
                    Other
                  </option>
                </select>
              </label>
            </div>

            <label
              className="
                mt-5
                block
              "
            >
              <span
                className="
                  mb-2
                  block
                  text-xs
                  font-semibold
                  text-[#102d43]
                "
              >
                Message

                <span
                  className="
                    ml-1
                    text-[#087e83]
                  "
                >
                  *
                </span>
              </span>

              <textarea
                rows={6}
                placeholder="Tell us what you need help with..."
                value={values.message}
                onChange={event =>
                  patch({
                    message:
                      event.target.value,
                  })
                }
                className={`
                  w-full
                  resize-y
                  rounded-xl
                  border
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  leading-6
                  text-[#102d43]
                  outline-none
                  transition

                  placeholder:text-slate-400

                  focus:border-[#087e83]/50
                  focus:ring-4
                  focus:ring-[#087e83]/[0.07]

                  ${
                    errors.message
                      ? 'border-red-300'
                      : 'border-border'
                  }
                `}
              />

              {errors.message ? (
                <span
                  className="
                    mt-1.5
                    block
                    text-[11px]
                    text-red-600
                  "
                >
                  {errors.message}
                </span>
              ) : null}
            </label>

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-border/80
                bg-[#faf9f6]
                p-4
              "
            >
              <div
                className="
                  mb-3
                  flex
                  items-start
                  gap-3
                "
              >
                <ShieldCheck
                  size={17}
                  className="
                    mt-0.5
                    shrink-0
                    text-[#087e83]
                  "
                />

                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-[#102d43]
                    "
                  >
                    Protected by
                    Cloudflare Turnstile
                  </p>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      leading-5
                      text-muted-foreground
                    "
                  >
                    This security check
                    helps prevent
                    automated form spam.
                  </p>
                </div>
              </div>

              <TurnstileWidget
                resetSignal={
                  resetTurnstile
                }
                onVerify={token => {
                  setTurnstileToken(
                    token
                  );

                  setTurnstileError(
                    ''
                  );
                }}
                onExpire={() => {
                  setTurnstileToken(
                    ''
                  );

                  setTurnstileError(
                    'The security check expired. Please complete it again.'
                  );
                }}
                onError={() => {
                  setTurnstileToken(
                    ''
                  );

                  setTurnstileError(
                    'The security check could not load. Please refresh and try again.'
                  );
                }}
              />

              {turnstileError ? (
                <p
                  className="
                    mt-2
                    text-[11px]
                    font-medium
                    text-red-600
                  "
                >
                  {turnstileError}
                </p>
              ) : null}
            </div>

            {errors.form ? (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
                role="alert"
              >
                {errors.form}
              </div>
            ) : null}

            {submitted ? (
              <div
                className="
                  mt-5
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-4
                  py-3
                  text-sm
                  text-emerald-800
                "
                role="status"
              >
                <CheckCircle2
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                  "
                />

                <div>
                  <p
                    className="
                      font-semibold
                    "
                  >
                    Message received.
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                    "
                  >
                    Thanks for contacting
                    Matelink. Our team will
                    review your enquiry.
                  </p>
                </div>
              </div>
            ) : null}

            <div
              className="
                mt-6
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p
                className="
                  max-w-md
                  text-[11px]
                  leading-5
                  text-muted-foreground
                "
              >
                By submitting, you agree
                that Matelink may contact
                you about this enquiry.
                Your details are used to
                respond to your request.
              </p>

              <button
                type="submit"
                disabled={
                  !canSubmit
                }
                className="
                  inline-flex
                  h-12
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#087e83]
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  transition

                  hover:bg-[#066e72]

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {submitting
                  ? 'Sending...'
                  : 'Send message'}

                {!submitting ? (
                  <Send size={15} />
                ) : null}
              </button>
            </div>
          </form>

          {/* =================================================
              RIGHT SUPPORT COLUMN
          ================================================== */}

          <aside
            className="
              space-y-5
            "
          >
            <div
              className="
                overflow-hidden
                rounded-[24px]
                border
                border-border/80
                bg-[#102d43]
                text-white
                shadow-[0_18px_50px_rgba(16,45,67,0.10)]
              "
            >
              <div
                className="
                  p-6
                  sm:p-7
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[#a7dddb]
                  "
                >
                  <Sparkles
                    size={15}
                  />

                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.13em]
                    "
                  >
                    What happens next
                  </span>
                </div>

                <h2
                  className="
                    mt-3
                    text-2xl
                    font-semibold
                    tracking-[-0.04em]
                  "
                >
                  Clear support, without
                  the runaround.
                </h2>

                <div
                  className="
                    mt-6
                    space-y-5
                  "
                >
                  {[
                    [
                      '01',
                      'We review your message',
                      'We check the enquiry and any booking context you provide.',
                    ],

                    [
                      '02',
                      'The right person follows up',
                      'We reply by email or phone depending on what you need.',
                    ],

                    [
                      '03',
                      'You choose the next step',
                      'Book, request a quote or simply get the answer you came for.',
                    ],
                  ].map(
                    ([
                      number,
                      title,
                      note,
                    ]) => (
                      <div
                        className="
                          flex
                          gap-4
                        "
                        key={number}
                      >
                        <span
                          className="
                            grid
                            h-8
                            w-8
                            shrink-0
                            place-items-center
                            rounded-full
                            bg-white/10
                            text-[10px]
                            font-bold
                            text-[#a7dddb]
                          "
                        >
                          {number}
                        </span>

                        <div>
                          <p
                            className="
                              text-sm
                              font-semibold
                            "
                          >
                            {title}
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-white/55
                            "
                          >
                            {note}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div
              className="
                rounded-[24px]
                border
                border-border/80
                bg-white
                p-5
                sm:p-6
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                  text-[#087e83]
                "
              >
                Need something else?
              </p>

              <div
                className="
                  mt-4
                  space-y-3
                "
              >
                <Link
                  to="/faq"
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-xl
                    border
                    border-border/70
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    transition
                    hover:bg-[#faf9f6]
                  "
                >
                  Frequently asked
                  questions

                  <ArrowRight
                    size={15}
                    className="
                      text-muted-foreground
                    "
                  />
                </Link>

                <Link
                  to="/bond-back-guarantee"
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-xl
                    border
                    border-border/70
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    transition
                    hover:bg-[#faf9f6]
                  "
                >
                  Bond Back Guarantee

                  <ArrowRight
                    size={15}
                    className="
                      text-muted-foreground
                    "
                  />
                </Link>
              </div>

              {instagram ||
              facebook ? (
                <div
                  className="
                    mt-5
                    border-t
                    border-border/70
                    pt-5
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                    "
                  >
                    Follow Matelink
                  </p>

                  <div
                    className="
                      mt-3
                      flex
                      gap-2
                    "
                  >
                    {instagram ? (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Matelink on Instagram"
                        className="
                          grid
                          h-10
                          w-10
                          place-items-center
                          rounded-full
                          border
                          border-border
                          text-[#102d43]
                          transition
                          hover:border-[#087e83]/30
                          hover:bg-[#edf6f5]
                          hover:text-[#087e83]
                        "
                      >
                        <Instagram
                          size={17}
                        />
                      </a>
                    ) : null}

                    {facebook ? (
                      <a
                        href={facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Matelink on Facebook"
                        className="
                          grid
                          h-10
                          w-10
                          place-items-center
                          rounded-full
                          border
                          border-border
                          text-[#102d43]
                          transition
                          hover:border-[#087e83]/30
                          hover:bg-[#edf6f5]
                          hover:text-[#087e83]
                        "
                      >
                        <Facebook
                          size={17}
                        />
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      {/* =====================================================
          MAP
      ====================================================== */}

      <section
        className="
          border-y
          border-border/70
          bg-white
        "
      >
        <div
          className="
            container-site
            py-10
            lg:py-14
          "
        >
          <div
            className="
              mb-6
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                  text-[#087e83]
                "
              >
                Find us
              </p>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-semibold
                  tracking-[-0.04em]
                  sm:text-3xl
                "
              >
                Matelink in Sydney
              </h2>

              <p
                className="
                  mt-2
                  flex
                  max-w-2xl
                  items-start
                  gap-2
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                <MapPin
                  size={16}
                  className="
                    mt-1
                    shrink-0
                    text-[#087e83]
                  "
                />

                {officeAddress}
              </p>
            </div>

            <a
              href={mapOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex
                h-10
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-border
                bg-white
                px-4
                text-xs
                font-semibold
                transition
                hover:bg-[#faf9f6]
              "
            >
              Open in Google Maps

              <ExternalLink
                size={14}
              />
            </a>
          </div>

          <div
            className="
              overflow-hidden
              rounded-[24px]
              border
              border-border
              bg-[#edf1ef]
              shadow-[0_14px_40px_rgba(16,45,67,0.06)]
            "
          >
            <iframe
              title="Matelink Cleaning location map"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="
                h-[360px]
                w-full
                border-0
                lg:h-[430px]
              "
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section
        className="
          container-site
          py-10
          lg:py-14
        "
      >
        <div
          className="
            flex
            flex-col
            gap-6
            rounded-[24px]
            bg-[#102d43]
            p-6
            text-white
            sm:p-8
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.13em]
                text-[#a7dddb]
              "
            >
              Ready when you are
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-semibold
                tracking-[-0.04em]
              "
            >
              Prefer to start with your
              cleaning details?
            </h2>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-white/60
              "
            >
              See your cleaning options
              online or request a custom
              quote for something less
              standard.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            <Link
              to="/book"
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                bg-white
                px-5
                text-sm
                font-semibold
                text-[#102d43]
                transition
                hover:bg-[#f3f6f7]
              "
            >
              BOOK NOW
            </Link>

            <Link
              to="/get-a-quote"
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-white/20
                bg-white/[0.04]
                px-5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-white/10
              "
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
