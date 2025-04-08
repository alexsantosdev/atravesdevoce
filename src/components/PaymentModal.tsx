import { useState } from 'react';
import { createInvite } from '@/services/database';
import { InviteStatus } from '@/types/database';
import styles from '@/styles/PaymentModal.module.scss';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateInviteData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  age: number;
  status: InviteStatus;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    age: '',
  });

  // Format CPF as user types (XXX.XXX.XXX-XX)
  const formatCPF = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply formatting
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formattedCPF });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean CPF before creating invite
      const cleanCpf = formData.cpf.replace(/\D/g, '');

      // Create invite first
      const inviteData: CreateInviteData = {
        name: formData.name,
        cpf: cleanCpf,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        status: 'PENDING',
      };

      await createInvite(inviteData);

      // Create checkout through API route
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          cpf: cleanCpf,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          inviteId: cleanCpf,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout');
      }

      const checkout = await response.json();

      // Get payment link and redirect
      const paymentLink = checkout.payment_url;
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        throw new Error('Payment URL not found in checkout response');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Erro ao criar pagamento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <h2 className={styles.title}>Preencha seus dados</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome Completo</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              value={formData.cpf}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Telefone</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="age">Idade</label>
            <input
              type="number"
              id="age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Processando...' : 'Pagar'}
          </button>
        </form>
      </div>
    </div>
  );
} 