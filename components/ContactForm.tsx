'use client';
import { FormEvent, useState } from 'react';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';

type Field = 'name' | 'email' | 'message';
type Errors = Partial<Record<Field, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldError(field: Field, value: string): string | undefined {
  const text = value.trim();
  if (field === 'name' && text.length < 2) return 'Please enter your name (at least 2 characters).';
  if (field === 'email' && !emailPattern.test(text)) return 'Enter a valid email address, e.g. name@company.com.';
  if (field === 'message' && text.length < 10) return 'Add a little more detail (at least 10 characters).';
  return undefined;
}

export default function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  function clearError(field: Field) {
    setErrors(previous => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
    if (state === 'error' || state === 'sent') {
      setState('idle');
      setError('');
    }
  }

  function check(field: Field, value: string) {
    setErrors(previous => ({ ...previous, [field]: fieldError(field, value) }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (data.website) return; // honeypot: silently accept bots

    const nextErrors: Errors = {};
    (['name', 'email', 'message'] as Field[]).forEach(field => {
      const message = fieldError(field, data[field] || '');
      if (message) nextErrors[field] = message;
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      const input = form.elements.namedItem(first);
      if (input instanceof HTMLElement) input.focus();
      setState('idle');
      return;
    }

    setState('sending');
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong');
      setState('sent');
      setErrors({});
      form.reset();
    } catch (err) {
      setError((err as Error).message);
      setState('error');
    }
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate aria-busy={state === 'sending'}>
      <div className="two-field">
        <label htmlFor="contact-name">
          YOUR NAME
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            minLength={2}
            placeholder="Full name"
            autoComplete="name"
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            onBlur={event => check('name', event.target.value)}
            onChange={() => clearError('name')}
          />
          {errors.name && <span className="field-error" id="contact-name-error">{errors.name}</span>}
        </label>

        <label htmlFor="contact-email">
          EMAIL ADDRESS
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="name@company.com"
            autoComplete="email"
            inputMode="email"
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            onBlur={event => check('email', event.target.value)}
            onChange={() => clearError('email')}
          />
          {errors.email && <span className="field-error" id="contact-email-error">{errors.email}</span>}
        </label>
      </div>

      <label htmlFor="contact-subject">
        SUBJECT <span className="input-hint">Optional — project enquiry, recruitment, collaboration</span>
        <input id="contact-subject" name="subject" placeholder="Project enquiry / Recruitment" autoComplete="off" />
      </label>

      <label htmlFor="contact-message">
        MESSAGE
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          rows={5}
          placeholder="Tell me about your project or opportunity..."
          aria-required="true"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-hint'}
          onBlur={event => check('message', event.target.value)}
          onChange={() => clearError('message')}
        />
        {errors.message
          ? <span className="field-error" id="contact-message-error">{errors.message}</span>
          : <span className="input-hint" id="contact-message-hint">A few sentences is plenty — scope, timeline and your role help most.</span>}
      </label>

      <input className="trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <button className="primary-btn" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? <LoaderCircle className="spin" size={17} /> : <ArrowUpRight size={18} />}
        {' '}{state === 'sending' ? 'SENDING...' : 'SEND ENQUIRY'}
      </button>

      {state === 'sent' && (
        <p className="form-success" role="status" aria-live="polite">
          MESSAGE RECEIVED. THANK YOU — I’LL BE IN TOUCH.
        </p>
      )}
      {state === 'error' && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
