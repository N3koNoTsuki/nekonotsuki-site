import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { skills, interests } from '../data/skills';
import styles from './About.module.css';

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: 'easeOut' } }
});

export default function About() {
  const { t } = useTranslation();

  const languages = [
    { key: 'fr', flag: '🇫🇷', level: t('about.langLevel.native') },
    { key: 'en', flag: '🇬🇧', level: t('about.langLevel.fluent') },
    { key: 'jp', flag: '🇯🇵', level: t('about.langLevel.learning') }
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.h1
          className="section-title"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {t('about.title')}
        </motion.h1>

        {/* Intro */}
        <motion.section
          className={styles.section}
          variants={fadeUp(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className={styles.sectionTitle}>{t('about.introTitle')}</h2>
          <p className={styles.intro}>{t('about.intro')}</p>
        </motion.section>

        {/* Skills */}
        <motion.section
          className={styles.section}
          variants={fadeUp(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className={styles.sectionTitle}>{t('about.skillsTitle')}</h2>
          <div className={styles.skillsGrid}>
            {skills.map((skill) => (
              <span
                key={skill.name}
                className={styles.skillTag}
                style={{ '--tag-color': skill.color }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Languages */}
        <motion.section
          className={styles.section}
          variants={fadeUp(0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className={styles.sectionTitle}>{t('about.langsTitle')}</h2>
          <div className={styles.langGrid}>
            {languages.map(({ key, flag, level }) => (
              <div key={key} className={styles.langCard}>
                <span className={styles.langFlag}>{flag}</span>
                <span className={styles.langName}>{t(`about.lang.${key}`)}</span>
                <span className={styles.langLevel}>{level}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Interests */}
        <motion.section
          className={styles.section}
          variants={fadeUp(0.25)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className={styles.sectionTitle}>{t('about.interestsTitle')}</h2>
          <div className={styles.interestsGrid}>
            {interests.map(({ label, icon }) => (
              <div key={label} className={styles.interestItem}>
                <span className={styles.interestIcon}>{icon}</span>
                <span className={styles.interestLabel}>{label}</span>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
