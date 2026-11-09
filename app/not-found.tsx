import Link from 'next/link';
export default function NotFound(){return <div className="error-screen"><span>ERROR / 404</span><h1>DRAWING NOT FOUND.</h1><p>This page doesn't exist or hasn't been published.</p><Link className="primary-btn" href="/">RETURN TO PORTFOLIO ↗</Link></div>}
