import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Home.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' }
  })
};

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className={styles.main}>
      {/* Sakura petals decoration (CSS only, header area) */}
      <div className={styles.petals} aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <span key={i} className={`${styles.petal} ${styles[`petal${i + 1}`]}`}>🌸</span>
        ))}
      </div>

      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          className={styles.avatar}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <img
            src="/images/avatar.jpg"
            alt="NekoNoTsuki avatar"
            onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}
          />
          <span className={styles.avatarFallback}>猫</span>
        </motion.div>

        <motion.h1
          className={styles.title}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          NekoNoTsuki
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          {t('home.subtitle')}
        </motion.p>

        <motion.div
          className={styles.ctas}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <Link to="/about" className={styles.ctaPrimary}>{t('home.cta')}</Link>
          <Link to="/timeline" className={styles.ctaSecondary}>{t('home.ctaTimeline')}</Link>
        </motion.div>
      </section>

      {/* Wave SVG */}
      <div className={styles.wave} aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="var(--bg-secondary)"
          />
        </svg>
      </div>

      {/* Quick intro strip */}
      <section className={styles.strip}>
        <div className="container">
          <div className={styles.stripGrid}>
            <div className={styles.stripItem}>
              <span className={styles.stripIcon}>⚙️</span>
              <span>Embedded Systems</span>
            </div>
            <div className={styles.stripItem}>
              <span className={styles.stripIcon}>🦀</span>
              <span>Rust / Python</span>
            </div>
            <div className={styles.stripItem}>
              <span className={styles.stripIcon}>🇯🇵</span>
              <span>日本語 N4–N5</span>
            </div>
            <div className={styles.stripItem}>
              <span className={styles.stripIcon}>🎤</span>
              <span>Vocaloid</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
