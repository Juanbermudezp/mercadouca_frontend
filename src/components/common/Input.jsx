import styles from './Input.module.css';

export default function Input({
  label, error, icon, hint, required, ...props
}) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}{required && <span className={styles.req}>*</span>}</label>}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input className={`${styles.input} ${icon ? styles.hasIcon : ''} ${error ? styles.hasError : ''}`} {...props} />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
