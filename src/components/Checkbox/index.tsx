import { ChangeEvent, ReactNode } from 'react'

import styles from './styles.module.scss'

interface CheckboxProps {
    label: ReactNode,
    checked: boolean | undefined,
    error?: boolean,
    onChange: (checked: boolean) => void
}

export function Checkbox({ label, checked, error, onChange }: CheckboxProps) {

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)

    return(
        <label className={styles.labelContainer}>
            <input className={styles.check} type='checkbox' checked={checked} onChange={handleChange} />
            <span className={`${styles.tile} ${error !== undefined && error && styles.error}`}></span>
            <div className={styles.rowText}>
                {label}
            </div>
        </label>
    )
}