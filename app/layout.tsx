import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'Structural Engineering | Portfolio',template:'%s | Structural Engineering'},description:'Structural engineering portfolio — design, analysis, drawings and projects.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
