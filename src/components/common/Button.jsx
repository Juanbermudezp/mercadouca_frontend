import styles from './Button.module.css';

export default function Button({
  children, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, icon, onClick, type = 'button', ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.full : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : icon}
      {children}
    </button>
  );
}
