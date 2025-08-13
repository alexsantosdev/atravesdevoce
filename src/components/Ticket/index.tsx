import styles from './styles.module.scss'

interface TicketProps {
    name: string
}

export function Ticket({ name }: TicketProps) {
    return(
        <div className={styles.ticketContainer}>
            <div className={styles.ticketData}>
                <img src='/images/event.jpg' alt='Encontro Submergidos' />
                <div className={styles.divider} />
                <div className={styles.detail}>
                    <h2>ENCONTRO SUBMERGIDOS</h2>
                    <span>{name}</span>
                    <div className={styles.footer}>
                        <div className={styles.row}>
                            <div className={styles.cell}>
                                <span>Fonte Igreja Apostólica</span>
                            </div>
                            <div className={styles.cell} style={{ borderLeft: '1px solid #141414'}}>
                                <span><b>19, 20 e 21 de Setembro</b></span>
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