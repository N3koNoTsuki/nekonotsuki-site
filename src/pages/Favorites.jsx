import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { favorites } from '../data/favorites';
import styles from './Favorites.module.css';

const SECTIONS = [
  { key: 'games', label: 'favorites.games', emoji: '🎮' },
  { key: 'anime', label: 'favorites.anime', emoji: '📺' },
  { key: 'manga', label: 'favorites.manga', emoji: '📚' },
  { key: 'music', label: 'favorites.music', emoji: '🎵' },
  { key: 'songs', label: 'favorites.songs', emoji: '🎵' }
];

function FavoriteCard({ item }) {
  const hasImage = item.image && item.image.length > 0;

  return (
    <motion.div
      className={styles.card}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.cardImageWrap}>
        {hasImage ? (
          <img src={item.image} alt={item.name} className={styles.cardImage} />
        ) : (
          <div className={styles.cardPlaceholder}>
            <span>{item.name.charAt(0)}</span>
          </div>
        )}
        <div className={styles.cardOverlay}>
          <span className={styles.cardName}>{item.name}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Favorites() {
  const { t } = useTranslation();

  return (
    <div className="page-wrapper">
      <div className="container">
        <motion.h1
          className="section-title"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {t('favorites.title')}
          <br />
          <span className={styles.subtitle}>{t('favorites.subtitle')}</span>
        </motion.h1>

        {SECTIONS.map(({ key, label, emoji }) => {
          const items = favorites.filter(f => f.category === key);
          if (items.length === 0) return null;

          return (
            <motion.section
              key={key}
              className={styles.section}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
            >
              <h2 className={styles.sectionTitle}>
                <span>{emoji}</span> {t(label)}
              </h2>
              <div className={styles.grid}>
                {items.map((item, i) => (
                  <FavoriteCard key={i} item={item} />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
