import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { timelineEvents } from '../data/timeline';
import styles from './Timeline.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Timeline() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.h1
          className="section-title"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {t('timeline.title')}
          <br />
          <span className={styles.subtitle}>{t('timeline.subtitle')}</span>
        </motion.h1>

        <div className={styles.timeline}>
          {/* Central line */}
          <div className={styles.line} />

          {timelineEvents.map((event, i) => (
            <motion.div
              key={i}
              className={`${styles.item} ${i % 2 === 0 ? styles.left : styles.right}`}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.icon}>{event.icon}</span>
                  <span className={styles.year}>{event.year}</span>
                </div>
                <h3 className={styles.cardTitle}>{event.title[lang] || event.title.fr}</h3>
                <p className={styles.cardDesc}>{event.description[lang] || event.description.fr}</p>
              </div>
              <div className={styles.dot} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
