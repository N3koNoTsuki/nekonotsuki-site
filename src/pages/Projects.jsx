import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { projects } from '../data/projects';
import styles from './Projects.module.css';

const STATUS_COLORS = {
  'En cours': '#fbbf24',
  'In progress': '#fbbf24',
  '進行中': '#fbbf24',
  'Terminé': '#4ade80',
  'Done': '#4ade80',
  '完了': '#4ade80'
};

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function Projects() {
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
          {t('projects.title')}
          <br />
          <span className={styles.subtitle}>{t('projects.subtitle')}</span>
        </motion.h1>

        <div className={styles.grid}>
          {projects.map((project, i) => {
            const statusText = project.status[lang] || project.status.fr;
            const statusColor = STATUS_COLORS[statusText] || 'var(--accent-primary)';

            return (
              <motion.div
                key={project.title}
                className={styles.card}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{project.title}</h2>
                  <span
                    className={styles.statusBadge}
                    style={{ '--status-color': statusColor }}
                  >
                    {statusText}
                  </span>
                </div>

                <p className={styles.cardDesc}>
                  {project.description[lang] || project.description.fr}
                </p>

                <div className={styles.tags}>
                  {project.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>

                <div className={styles.footer}>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.githubLink}
                    >
                      <GitHubIcon />
                      {t('projects.viewGithub')}
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
