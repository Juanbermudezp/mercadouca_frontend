import styles from './UI.module.css';

export function Card({ children, className = '', hover, ...props }) {
  return (
    <div className={`${styles.card} ${hover ? styles.cardHover : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, color = 'blue', size = 'sm' }) {
  return <span className={`${styles.badge} ${styles[color]} ${styles[size]}`}>{children}</span>;
}

export function Spinner({ size = 24 }) {
  return <div className={styles.spinner} style={{ width: size, height: size }} />;
}

export function Empty({ icon, title, subtitle, action }) {
  return (
    <div className={styles.empty}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {subtitle && <p className={styles.emptySub}>{subtitle}</p>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={`skeleton ${styles.skImg}`} />
      <div className={styles.skBody}>
        <div className={`skeleton ${styles.skLine}`} />
        <div className={`skeleton ${styles.skLineShort}`} />
        <div className={`skeleton ${styles.skLine}`} />
      </div>
    </div>
  );
}

export function Stars({ rating = 0, max = 5 }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );
}
