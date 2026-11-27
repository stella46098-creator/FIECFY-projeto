import { Play } from 'lucide-react'
import styles from './PlayButton.module.css'

export default function PlayButton({ onClick, label = 'Reproduzir' }) {
  return (
    <button className={styles.button} onClick={onClick} aria-label={label} title={label}>
      <Play size={18} fill="currentColor" />
    </button>
  )
}
