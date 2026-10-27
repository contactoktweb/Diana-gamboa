import Image from 'next/image';
import Brand from './Brand';

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="auth">
    <div className="auth-panel">
      <Brand />
      <div className="auth-box">
        <h1>{title}</h1>
        <p className="auth-sub">{subtitle}</p>
        {children}
      </div>
    </div>
    <div className="auth-visual" aria-hidden="true">
      <Image src="/diana-negro.webp" alt="" fill sizes="50vw" />
    </div>
  </main>;
}
