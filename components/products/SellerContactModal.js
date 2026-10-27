'use client';

// ข้อมูลติดต่อผู้ขาย (TASK-18)
// API ส่ง channels พร้อม deep_link มาให้แล้ว แต่ถ้า backend ยังไม่ได้ใส่ เราสร้างลิงก์เองจาก value
// LINE: https://line.me/ti/p/~<line_id> · โทร: tel:<phone_number>

import { ChatIcon, MapPinIcon, PhoneIcon, ShieldIcon } from '@/components/ui/icons.js';
import { Modal } from '@/components/ui/Modal.js';
import styles from './SellerContactModal.module.css';

const DEFAULT_SAFETY_NOTE =
  'นัดรับในพื้นที่จุฬาฯ ช่วงเวลากลางวัน และตรวจสอบสินค้าก่อนชำระเงินทุกครั้ง';

const CHANNEL_META = {
  line: { label: 'ทักแชต LINE', Icon: ChatIcon },
  phone: { label: 'โทรติดต่อ', Icon: PhoneIcon },
};

function deepLinkFor(channel) {
  if (channel.deep_link) return channel.deep_link;
  if (channel.type === 'line') return `https://line.me/ti/p/~${channel.value}`;
  if (channel.type === 'phone') return `tel:${channel.value}`;
  return null;
}

/** รองรับทั้ง channels[] ตาม spec และข้อมูลดิบ (phone_number / line_id) เผื่อ backend ส่งมาแบบนั้น */
function readChannels(contact) {
  if (Array.isArray(contact?.channels) && contact.channels.length > 0) return contact.channels;

  const seller = contact?.seller ?? {};
  const channels = [];
  if (seller.line_id) channels.push({ type: 'line', value: seller.line_id });
  if (seller.phone_number) channels.push({ type: 'phone', value: seller.phone_number });
  return channels;
}

export function SellerContactModal({ contact, onClose }) {
  const channels = readChannels(contact);

  return (
    <Modal
      title="ติดต่อผู้ขาย"
      onClose={onClose}
      footer={
        <p className={styles.safety}>
          <ShieldIcon size={16} />
          <span>{contact?.safety_note || DEFAULT_SAFETY_NOTE}</span>
        </p>
      }
    >
      <p className={styles.sellerName}>{contact?.seller?.full_name}</p>
      {contact?.seller?.faculty && <p className={styles.faculty}>{contact.seller.faculty}</p>}

      {contact?.pickup_location && (
        <p className={styles.pickup}>
          <MapPinIcon size={16} />
          <span>
            นัดรับที่ <strong>{contact.pickup_location}</strong>
          </span>
        </p>
      )}

      <div className={styles.channels}>
        {channels.length === 0 && (
          <p className="muted" style={{ fontSize: 13 }}>
            ผู้ขายยังไม่ได้ระบุช่องทางติดต่อ
          </p>
        )}

        {channels.map((channel) => {
          const meta = CHANNEL_META[channel.type];
          const href = deepLinkFor(channel);
          if (!meta || !href) return null;
          const { Icon } = meta;

          return (
            <a
              key={channel.type}
              href={href}
              className={`btn btn--lg btn--block ${
                channel.type === 'line' ? 'btn--primary' : 'btn--outline'
              }`}
              // tel: เปิดแอปโทรศัพท์ในหน้าเดิม ส่วน LINE เปิดแท็บใหม่
              target={channel.type === 'line' ? '_blank' : undefined}
              rel={channel.type === 'line' ? 'noopener noreferrer' : undefined}
            >
              <Icon size={18} />
              {meta.label}
              <span className={styles.channelValue}>{channel.value}</span>
            </a>
          );
        })}
      </div>
    </Modal>
  );
}
