import Link from "next/link";

import styles from "./Footer.module.css";

const currentYear = new Date().getFullYear();

const Footer = () => (
  <footer className={styles.footer} role="contentinfo">
    <div className={styles.inner}>
      <div className={styles.brandSection}>
        <div className={styles.logo}>MetaSwap</div>
        <p className={styles.tagline}>
          Orquestando swaps multired en Solana con precisión institucional y una
          experiencia cuidada al detalle.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Producto</h3>
          <ul className={styles.linkList}>
            <li>
              <Link href="#tab-swap" className={styles.link}>
                Panel de intercambio
              </Link>
            </li>
            <li>
              <Link href="#tab-overview" className={styles.link}>
                Vista operativa
              </Link>
            </li>
            <li>
              <Link href="#tab-support" className={styles.link}>
                Centro de soporte
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Recursos</h3>
          <ul className={styles.linkList}>
            <li>
              <a
                className={styles.link}
                href="https://station.jup.ag/"
                target="_blank"
                rel="noreferrer"
              >
                Integración con Jupiter
              </a>
            </li>
            <li>
              <a
                className={styles.link}
                href="https://solana.com/es/developers"
                target="_blank"
                rel="noreferrer"
              >
                Documentación Solana
              </a>
            </li>
            <li>
              <a
                className={styles.link}
                href="mailto:hola@metaswap.app"
              >
                Contacto comercial
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Comunidades</h3>
          <div className={styles.socialRow}>
            <a
              className={styles.socialLink}
              href="https://twitter.com/solana"
              target="_blank"
              rel="noreferrer"
              aria-label="Canal en X"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4.5 4.5h4.4l3.1 4.6 3.3-4.6h4.2l-5.6 7.4 5.9 7.6h-4.4l-3.6-5.1-3.7 5.1H4.7l6-7.8-6.2-7.2z" />
              </svg>
            </a>
            <a
              className={styles.socialLink}
              href="https://discord.com/invite/solana"
              target="_blank"
              rel="noreferrer"
              aria-label="Servidor de Discord"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M19.8 5.6A15.6 15.6 0 0 0 15.3 4l-.3.6a14.6 14.6 0 0 1 3.5 1.7 11.3 11.3 0 0 0-10.8 0A14.6 14.6 0 0 1 11 4l-.3-.6A15.6 15.6 0 0 0 6.2 5.6 16.8 16.8 0 0 0 4 15.7a15.6 15.6 0 0 0 4.9 1.9l.7-.8c-.9-.3-1.7-.8-2.3-1.4l.5-.4c1.5 1 3.4 1.6 5.2 1.6s3.7-.6 5.2-1.6l.5.4c-.6.6-1.4 1.1-2.3 1.4l.7.8a15.6 15.6 0 0 0 4.9-1.9 16.8 16.8 0 0 0-2.2-10.1Zm-9.9 7c-.9 0-1.7-.8-1.7-1.8 0-1 .8-1.8 1.7-1.8s1.7.8 1.7 1.8c0 1-.8 1.8-1.7 1.8Zm5.2 0c-.9 0-1.7-.8-1.7-1.8 0-1 .8-1.8 1.7-1.8s1.7.8 1.7 1.8c0 1-.8 1.8-1.7 1.8Z"
                />
              </svg>
            </a>
            <a
              className={styles.socialLink}
              href="https://github.com/solana-labs"
              target="_blank"
              rel="noreferrer"
              aria-label="Repositorio en GitHub"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-2c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.5 1 3.1.7.1-.7.3-1 .6-1.2-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.7-.3 2.6-.3s1.8.1 2.6.3c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.8 1 1.7 1 2.8 0 3.8-2.3 4.6-4.5 4.9.3.3.6.8.6 1.6v2.4c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"
                />
              </svg>
            </a>
          </div>
          <div className={styles.statusBadge}>
            Red optimizada para transacciones en tiempo real
          </div>
        </div>
      </div>

      <div className={styles.legalRow}>
        <span className={styles.copyright}>
          © {currentYear} MetaSwap. Todos los derechos reservados.
        </span>
        <div className={styles.legalLinks}>
          <a className={styles.link} href="#">Aviso legal</a>
          <a className={styles.link} href="#">Privacidad</a>
          <a className={styles.link} href="#">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
