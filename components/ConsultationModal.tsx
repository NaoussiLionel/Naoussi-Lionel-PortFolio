 'use client';

import { useEffect, useState } from 'react';

export default function ConsultationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  if (!open) return null;
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const subject = encodeURIComponent('Consultation request — The Wordsmith');
    const body = encodeURIComponent(
      `Name: ${fd.get('name')}\nEmail: ${fd.get('email')}\nProject type: ${fd.get('project')}\n\n${fd.get('message')}`
    );
    window.location.href = `mailto:hello@thewordsmith.studio?subject=${subject}&body=${body}`;
    setSent(true);
  }
  return <div className="booking-overlay" role="dialog" aria-modal="true" aria-label="Book a consultation" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="booking-modal">
      <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
      <div className="modal-kicker">THE WORDSMITH / PRIVATE APPOINTMENT</div>
      <h2>BOOK A CONSULTATION</h2>
      {sent ? <p className="modal-success">Your enquiry is ready to send. Your mail client should open now.</p> :
      <form onSubmit={submit}>
        <label>NAME<input name="name" required /></label>
        <label>EMAIL<input name="email" type="email" required /></label>
        <label>PROJECT TYPE<select name="project" defaultValue="Website Architecture"><option>Website Architecture</option><option>Strategic Email Funnels</option><option>Brand Voice Guidelines</option><option>Launch Campaign</option></select></label>
        <label>PROJECT NOTE<textarea name="message" rows={5} required /></label>
        <button className="modal-submit" type="submit">SEND ENQUIRY →</button>
      </form>}
    </div>
  </div>;
}
