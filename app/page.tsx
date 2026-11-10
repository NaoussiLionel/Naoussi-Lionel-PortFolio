'use client';

import { useEffect, useRef, useState } from 'react';
import ConsultationModal from '@/components/ConsultationModal';

const services=[
 {n:'SERVICE 01',title:'Website Architecture',img:'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',text:'Words, structure and user journeys designed to turn a beautiful interface into a persuasive one.'},
 {n:'SERVICE 02',title:'Strategic Email Funnels',img:'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',text:'Sequences that move readers from curious to convinced without sounding like a sales machine.'},
 {n:'SERVICE 03',title:'Brand Voice Guidelines',img:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',text:'A precise verbal identity your team can actually use, repeat and protect.'}
];
const cases=[
 {title:'The Website Overhaul',client:'Lumina Skincare',stats:'+45% conversions · $120k revenue',text:'A strategic rewrite that clarified the offer, tightened the journey and gave every page a job.'},
 {title:'The 7-Day Launch',client:'Creator Studio',stats:'62% open rate · 48h to sell out',text:'A launch narrative built around urgency, trust and a sequence that made the next action obvious.'}
];
const steps=[['I. THE INTERROGATION','We ask the uncomfortable questions until the real offer, audience and objection are impossible to miss.'],['II. THE BLUEPRINT','We map the argument before writing a sentence: hierarchy, proof, promise and action.'],['III. THE DRAFT','Then comes the language — clear, specific, human and deliberately hard to ignore.'],['IV. THE POLISH','Every word earns its place. Rhythm, clarity and conversion are refined until the piece reads effortlessly.']];
const reviews=[['“','Eleanor found the sentence hiding inside our entire business. Suddenly the site sounded like us — only sharper.','MARA CHEN / LUMINA SKINCARE'],['“','The launch sequence did not feel like a funnel. It felt like a conversation that happened to sell out.','JON BELL / CREATOR STUDIO']];

export default function Home(){
 const [modal,setModal]=useState(false);
 const statsRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=statsRef.current;if(!el)return;const nums=el.querySelectorAll<HTMLElement>('[data-count]');const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)return;nums.forEach(n=>{const target=Number(n.dataset.count);let v=0;const step=Math.max(1,Math.ceil(target/35));const tick=()=>{v=Math.min(target,v+step);n.textContent=String(v);if(v<target)requestAnimationFrame(tick)};tick()});io.disconnect()},{threshold:.35});io.observe(el);return()=>io.disconnect()},[]);
 return <div className="wordsmith">
 <header className="ws-masthead" id="top">
  <div className="ws-issue">ISSUE NO. 01 · THE WEB EXCLUSIVE · MAY 2026</div>
  <div className="ws-title">THE WORDSMITH</div>
  <div className="ws-rule double"/>
  <nav className="ws-nav"><a href="#offerings">COPYWRITING</a><span>✒</span><a href="#method">BRAND STRATEGY</a><span>✒</span><a href="#contact">EMAIL MARKETING</a></nav>
 </header>
 <main>
  <section className="ws-hero ws-wrap">
   <div className="ws-portrait">
    <div className="ws-photo" style={{backgroundImage:`url(https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1100&q=85&grayscale)`}}/>
    <div className="ws-quote">“I write the words you have been struggling to find for months.”<small>— E. VANCE</small></div>
    <div className="ws-start"><span>READY TO START?</span><button onClick={()=>setModal(true)}>BOOK A CONSULTATION →</button></div>
   </div>
   <article className="ws-lead">
    <div className="ws-kicker">THE LEAD STORY / OPINION</div>
    <h1>Why Beautiful Design Fails Without Strategic Copy.</h1>
    <div className="ws-byline">BY ELEANOR VANCE <span>|</span> READING TIME: 3 MIN</div>
    <div className="ws-columns"><p>Design catches the eye. Words close the sale.</p><p>The strongest brand can lose the room when its language asks the reader to work too hard. Strategic copy gives beautiful design a destination: a reason to stay, a reason to believe and, eventually, a reason to act.</p><p>Good copy is not decoration. It is architecture for attention. It turns a vague promise into a precise proposition and makes the next step feel obvious.</p></div>
   </article>
  </section>
  <section className="ws-press"><div className="ws-wrap"><span>WORDS PRINTED &amp; FEATURED IN</span><div><b>The Times</b><b>VOGUE</b><b>Business Insider</b><b>WIRED</b><b>Forbes</b></div></div></section>
  <section className="ws-section ws-wrap" id="offerings"><div className="ws-section-title">The Editorial Offerings</div><div className="ws-cards">{services.map(s=><article className="ws-card" key={s.n}><div className="ws-meta">{s.n}</div><div className="ws-card-photo" style={{backgroundImage:`url(${s.img})`}}/><h3>{s.title}</h3><p>{s.text}</p><a href="#contact">INQUIRE NOW →</a></article>)}</div></section>
  <section className="ws-method ws-wrap" id="method"><div className="ws-method-intro"><div className="ws-kicker">THE EDITORIAL PROCESS</div><h2>The Methodology.</h2><p>Before the first draft comes the first question. Before the clever line comes the commercial truth.</p></div><div className="ws-steps">{steps.map(s=><article key={s[0]}><span>{s[0]}</span><p>{s[1]}</p></article>)}</div></section>
  <section className="ws-clippings" id="clippings"><div className="ws-wrap"><div className="ws-section-title light">Recent Clippings</div><div className="ws-case-grid">{cases.map(c=><article className="ws-case" key={c.title}><div className="ws-meta">{c.client}</div><h3>{c.title}</h3><strong>{c.stats}</strong><p>{c.text}</p><a href="#contact">READ THE FULL STUDY →</a></article>)}</div></div></section>
  <section className="ws-editor ws-wrap"><div className="ws-section-title">MEET THE EDITOR</div><div className="ws-editor-grid"><div className="ws-editor-photo"><div style={{backgroundImage:`url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85&grayscale)`}}/><span>ELEANOR VANCE, CHIEF WORDSMITH</span></div><div className="ws-interview"><div className="ws-kicker">EXCLUSIVE INTERVIEW</div><h2>The woman behind the words.</h2>{[['How did you start writing?','By noticing how often a good idea was trapped inside a bad sentence. I wanted to free it.'],['What is your writing philosophy?','Clarity first. Personality second. Cleverness only when it earns its keep.'],['Who should hire you?','Founders, teams and brands who know what they mean — but need someone to make everyone else understand it.']].map(q=><div className="ws-qa" key={q[0]}><b>{q[0]}</b><p>{q[1]}</p></div>)}</div></div></section>
  <section className="ws-reviews ws-wrap"><div className="ws-section-title">The Critics' Review</div><div className="ws-review-grid">{reviews.map(r=><blockquote key={r[2]}><span>{r[0]}</span><p>{r[1]}</p><footer>{r[2]}</footer></blockquote>)}</div></section>
  <section className="ws-investment ws-wrap" id="investment"><div className="ws-section-title">The Investment</div><div className="ws-price-grid"><article><div className="ws-meta">01 / WEBSITE</div><h3>Website Rewrite</h3><div className="ws-price">from $2,500</div><ul><li>Messaging strategy</li><li>Core page copy</li><li>Conversion-focused hierarchy</li><li>Two rounds of refinement</li></ul><button onClick={()=>setModal(true)}>BOOK THE PROJECT →</button></article><article className="dark"><span className="popular">MOST POPULAR</span><div className="ws-meta">02 / LAUNCH</div><h3>The Launch Funnel</h3><div className="ws-price">from $1,500</div><ul><li>Launch narrative</li><li>7-email sequence</li><li>Landing page copy</li><li>Subject lines + CTAs</li></ul><button onClick={()=>setModal(true)}>START A CONVERSATION →</button></article></div></section>
  <section className="ws-stats ws-wrap" ref={statsRef}><div><strong data-count="120">0</strong><span>BRANDS &amp; FOUNDERS</span></div><div><strong data-count="94">0</strong><span>WORDS THAT WORKED</span></div><div><strong data-count="7">0</strong><span>YEARS IN EDITORIAL</span></div></section>
 </main>
 <footer className="ws-footer" id="contact"><div className="ws-wrap"><div className="ws-footer-line">If the idea is worth building, it is worth finding the right words.</div><div className="ws-contact"><a href="mailto:hello@thewordsmith.studio">hello@thewordsmith.studio</a><button onClick={()=>setModal(true)}>BOOK A CONSULTATION →</button></div><div className="ws-colophon">© THE WORDSMITH · ELEANOR VANCE · STRATEGIC COPYWRITING STUDIO · MADE FOR THE WEB</div></div></footer>
 <ConsultationModal open={modal} onClose={()=>setModal(false)}/>
 </div>
}
