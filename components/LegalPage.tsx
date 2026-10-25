import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function LegalPage({ title }: { title: string }) {
  return <>
    <SiteHeader />
    <main className="section"><div className="wrap legal">
      <h1>{title}</h1>
      <p>Documento en preparación. Aquí se publicará el texto definitivo antes de abrir el registro.</p>
    </div></main>
    <SiteFooter />
  </>;
}
