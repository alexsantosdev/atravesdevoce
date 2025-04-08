import styles from './styles.module.scss'

interface TicketProps {
    name: string
}

export function Ticket({ name }: TicketProps) {
    return(
        <div className={styles.ticketContainer}>
            <div className={styles.ticketData}>
                <img src='/images/ticket-image.png' alt='ticket image' />
                <div className={styles.divider} />
                <div className={styles.detail}>
                    <h2>CONFERÊNCIA DE MULHERES</h2>
                    <span>{name}</span>
                    <div className={styles.footer}>
                        <div className={styles.row}>
                            <div className={styles.cell}>
                                <span>Através de Você</span>
                            </div>
                            <div className={styles.cell} style={{ borderLeft: '1px solid #141414'}}>
                                <span><b>23 e 24 de Maio</b></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.dashedDivider} />
            <div className={styles.ticketCode}>
                <img src='/images/barcode.svg' alt='barcode' />
            </div>
        </div>
    )
}