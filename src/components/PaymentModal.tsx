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
  birthDate: string;
  church: 'FONTE' | 'OUTROS';
  churchOther?: string;
  shirtSize: 'P' | 'M' | 'G' | 'GG' | 'G1' | 'G2';
  emergencyContact: string;
  cellGroup?: string;
  hasParticipatedPeniel: boolean;
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
    birthDate: '',
    church: 'FONTE' as 'FONTE' | 'OUTROS',
    churchOther: '',
    shirtSize: 'P' as 'P' | 'M' | 'G' | 'GG' | 'G1' | 'G2',
    emergencyContact: '',
    participatesCell: false,
    cellGroup: '',
    hasParticipatedPeniel: false,
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

  // Format phone number as user types ((XX) XXXXX-XXXX)
  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Apply formatting
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formattedPhone });
  };

  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData({ ...formData, emergencyContact: formattedPhone });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.cpf || !formData.email || !formData.phone || 
          !formData.age || !formData.birthDate || !formData.church || 
          !formData.shirtSize || !formData.emergencyContact) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Validate church other field
      if (formData.church === 'OUTROS' && !formData.churchOther) {
        alert('Por favor, especifique qual igreja você frequenta.');
        setLoading(false);
        return;
      }

      // Validate cell group field if participates in cell
      if (formData.participatesCell && !formData.cellGroup.trim()) {
        alert('Por favor, informe qual célula você participa.');
        setLoading(false);
        return;
      }

      // Clean CPF before creating invite
      const cleanCpf = formData.cpf.replace(/\D/g, '');

      // Clean phone number before creating invite
      const cleanPhone = formData.phone.replace(/\D/g, '');

      // Clean emergency contact
      const cleanEmergencyContact = formData.emergencyContact.replace(/\D/g, '');

      // Create invite first
      const inviteData: CreateInviteData = {
        name: formData.name,
        cpf: cleanCpf,
        email: formData.email,
        phone: cleanPhone,
        age: parseInt(formData.age),
        birthDate: formData.birthDate,
        church: formData.church,
        churchOther: formData.churchOther,
        shirtSize: formData.shirtSize,
        emergencyContact: cleanEmergencyContact,
        cellGroup: formData.participatesCell ? formData.cellGroup : undefined,
        hasParticipatedPeniel: formData.hasParticipatedPeniel,
        status: 'PENDING',
      };

      console.log('Creating invite with data:', inviteData);

      await createInvite(inviteData);

      console.log('Invite created successfully, creating checkout...');

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
          phone: cleanPhone,
          age: parseInt(formData.age),
          birthDate: formData.birthDate,
          church: formData.church,
          churchOther: formData.churchOther,
          shirtSize: formData.shirtSize,
          emergencyContact: cleanEmergencyContact,
          cellGroup: formData.participatesCell ? formData.cellGroup : undefined,
          hasParticipatedPeniel: formData.hasParticipatedPeniel,
          inviteId: cleanCpf,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.details || 'Failed to create checkout');
      }

      const checkout = await response.json();
      console.log('Checkout created:', checkout);

      // Get payment link and redirect
      const paymentLink = checkout.payment_url;
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        throw new Error('Payment URL not found in checkout response');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert(`Erro ao criar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
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

          <div className={styles.formGroup}>
            <label htmlFor="birthDate">Data de Nascimento</label>
            <input
              type="date"
              id="birthDate"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>De qual igreja você faz parte?</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="radio"
                  name="church"
                  value="FONTE"
                  checked={formData.church === 'FONTE'}
                  onChange={(e) => setFormData({ ...formData, church: e.target.value as 'FONTE' | 'OUTROS' })}
                />
                Fonte
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="radio"
                  name="church"
                  value="OUTROS"
                  checked={formData.church === 'OUTROS'}
                  onChange={(e) => setFormData({ ...formData, church: e.target.value as 'FONTE' | 'OUTROS' })}
                />
                Outros
              </label>
            </div>
          </div>

          {formData.church === 'OUTROS' && (
            <div className={styles.formGroup}>
              <label htmlFor="churchOther">Qual igreja?</label>
              <input
                type="text"
                id="churchOther"
                value={formData.churchOther}
                onChange={(e) => setFormData({ ...formData, churchOther: e.target.value })}
                required={formData.church === 'OUTROS'}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="shirtSize">Numeração da Camiseta</label>
            <select
              id="shirtSize"
              value={formData.shirtSize}
              onChange={(e) => setFormData({ ...formData, shirtSize: e.target.value as 'P' | 'M' | 'G' | 'GG' | 'G1' | 'G2' })}
              required
            >
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
              <option value="GG">GG</option>
              <option value="G1">G1</option>
              <option value="G2">G2</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="emergencyContact">Contato de Emergência</label>
            <input
              type="tel"
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleEmergencyContactChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.participatesCell}
                onChange={(e) => setFormData({ ...formData, participatesCell: e.target.checked })}
              />
              Você participa de uma célula?
            </label>
          </div>

          {formData.participatesCell && (
            <div className={styles.formGroup}>
              <label htmlFor="cellGroup">Qual célula você participa?</label>
              <input
                type="text"
                id="cellGroup"
                value={formData.cellGroup}
                onChange={(e) => setFormData({ ...formData, cellGroup: e.target.value })}
                placeholder="Ex: Célula do João"
                required={formData.participatesCell}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.hasParticipatedPeniel}
                onChange={(e) => setFormData({ ...formData, hasParticipatedPeniel: e.target.checked })}
              />
              Já participou do Encontro Peniel?
            </label>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Processando...' : 'Pagar'}
          </button>
        </form>
      </div>
    </div>
  );
} 