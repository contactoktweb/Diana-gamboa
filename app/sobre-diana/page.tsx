import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Sobre Diana | Diana Gamboa · El idioma del mercado',
  description: 'Analista del mercado de valores, educadora y madre. Diana Gamboa enseña a leer el mercado vela a vela, con calma, en orden y desde cero.',
};

export default function SobreDianaPage() {
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <SiteHeader />
    <main id="contenido">
      <section className="story-hero">
        <div className="wrap story-hero-grid">
          <div className="story-hero-copy">
            <p className="eyebrow">Sobre Diana</p>
            <h1>Hola, soy Diana Gamboa</h1>
            <p className="lead">Analista del mercado de valores, educadora, madre y una mujer profundamente enamorada de lo que hace.</p>
          </div>
          <div className="story-hero-photo">
            <Image src="/diana-negro.webp" alt="Diana Gamboa" fill priority sizes="(max-width: 860px) 90vw, 40vw" />
          </div>
        </div>
      </section>

      <article className="story wrap">
        <div className="story-block">
          <p>Durante años miré gráficas todos los días, hasta que un día comprendí algo que lo cambió todo:</p>
          <p className="story-pull">No puedes pretender ser rentable si primero no aprendes a leer y entender el comportamiento del mercado, vela a vela.</p>
          <p>Saber qué te dice cada vela. Reconocer cómo utilizar los indicadores básicos. Entender lo que visualmente te está mostrando cada uno.</p>
          <p>Ese es el primer objetivo: <strong>aprender a leer el mercado antes de buscar un patrón, antes de aplicar una estrategia y antes de comprar o vender.</strong></p>
        </div>

        <div className="story-block">
          <p>Y aquí viene algo que casi nadie te dice:</p>
          <p className="story-big">Cada vela es una emoción.</p>
          <p>Es el resultado de las decisiones de compradores y vendedores, de sus miedos, su euforia, sus dudas y sus expectativas sobre lo que puede suceder con el precio.</p>
          <p>Cuando aprendes a leer una gráfica, también comienzas a reconocer las emociones que se reflejan en el comportamiento del mercado.</p>
          <p className="story-pull">Pero ¿cómo vas a leer las emociones del mercado si no sabes reconocer las tuyas?</p>
        </div>

        <div className="story-block">
          <p>Soy una mujer espiritual y creo profundamente en la conexión entre la mente, el cuerpo y el alma.</p>
          <p>Una mente tranquila nos ayuda a observar con claridad. Un cuerpo descansado nos permite estar más atentos. Y un alma en paz nos enseña algo que considero fundamental: <strong>saber esperar.</strong></p>
          <p>Porque si un día tus emociones están hechas un revoltillo, lo mejor es no operar. Así de sencillo.</p>
          <p>El conocimiento es importante, pero también lo son la paciencia, la disciplina y las emociones en equilibrio.</p>
          <p>Por eso, cuando enseño, no solo me importa la gráfica. <strong>También me importa la persona que está frente a ella.</strong></p>
        </div>

        <div className="story-block">
          <p>Así nació el <strong>Método Diana Gamboa</strong>: para enseñarte el idioma del mercado pieza por pieza, en orden, con calma y desde cero.</p>
          <ul className="story-pieces">
            <li>Las velas te cuentan quién tiene el control.</li>
            <li>Las medias móviles te muestran cómo respira el precio.</li>
            <li>Los niveles te dicen dónde abrir los ojos.</li>
          </ul>
          <p>Y cuando aprendes a conectar todas esas piezas, la gráfica deja de ser un misterio y comienza a hablarte.</p>
        </div>

        <div className="story-block">
          <p>No importa si nunca has abierto una gráfica. <strong>Aquí nadie se queda atrás.</strong></p>
          <p>Conmigo no vas a encontrar promesas de dinero fácil, señales para copiar ni atajos.</p>
          <p>Vas a encontrar a alguien que te habla claro, que te muestra lo que funciona y también lo que no, y que celebra contigo ese día en que miras una gráfica y dices:</p>
          <p className="story-big">«¡Ya la entiendo!»</p>
        </div>

        <div className="story-block">
          <p>Porque mi sueño no es que dependas de mí.</p>
          <p className="story-pull">Es que un día ya no me necesites.</p>
          <blockquote className="signature story-signature">Yo no adivino el mercado. Lo leo. Y te enseño a leerlo.</blockquote>
        </div>
      </article>

      <section className="section invite" aria-labelledby="historia-cta">
        <div className="wrap invite-inner">
          <h2 id="historia-cta">Comienza tu formación desde cero</h2>
          <Link href="/registro" className="btn btn-gold btn-lg">Quiero aprender con Diana <ArrowRight size={20} aria-hidden="true" /></Link>
          <p className="cta-note">Crea tu cuenta gratis y descubre tu ruta de aprendizaje.</p>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
