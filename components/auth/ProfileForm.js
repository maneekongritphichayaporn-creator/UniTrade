'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, logout } from '@/lib/client/auth.js';
import { request } from '@/lib/client/api.js';
import { USE_MOCK_API } from '@/lib/client/config.js';
import { getFaculties } from '@/lib/client/faculties.js';
import { routes } from '@/lib/client/routes.js';
import { updateSessionUser } from '@/lib/client/session.js';
import { useAuth } from '@/lib/client/useAuth.js';
import styles from './AccountForms.module.css';

export function ProfileForm() {
  const router = useRouter();
  const { status } = useAuth();
  const [profile, setProfile] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [values, setValues] = useState({ full_name: '', phone_number: '', line_id: '', faculty: '', faculty_other: '' });
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === 'guest') router.replace(routes.login(routes.profile));
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    const controller = new AbortController();
    Promise.all([getMe({ signal: controller.signal }), getFaculties({ signal: controller.signal })])
      .then(([me, list]) => {
        setProfile(me);
        setFaculties(list.data);
        setValues({ full_name: me.full_name ?? '', phone_number: me.phone_number ?? '',
          line_id: me.line_id ?? '', faculty: list.data.includes(me.faculty) ? me.faculty : 'other',
          faculty_other: list.data.includes(me.faculty) ? '' : me.faculty ?? '' });
      })
      .catch((err) => { if (err.name !== 'AbortError') setError(err); });
    return () => controller.abort();
  }, [status]);

  function change(key, value) { setValues((current) => ({ ...current, [key]: value })); }

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    if (USE_MOCK_API) {
      setError({ message: 'โหมดข้อมูลจำลองยังไม่บันทึกโปรไฟล์ กรุณาเชื่อมต่อ API จริงเพื่อแก้ไข' });
      return;
    }
    setPending(true);
    try {
      const updated = await request('/auth/me', { method: 'PATCH', body: values });
      setProfile(updated);
      updateSessionUser(updated);
      setSaved(true);
    } catch (err) { setError(err); }
    finally { setPending(false); }
  }

  function signOut() { logout(); router.push(routes.home); }

  return <section className={styles.page}>
    <div className={styles.heading}><h1>Profile</h1><p>Manage your account</p></div>
    <div className={styles.card}>
      {status === 'loading' || (status === 'authenticated' && !profile && !error)
        ? <p>กำลังโหลดโปรไฟล์…</p>
        : status === 'guest' ? <p>กำลังพาไปหน้าเข้าสู่ระบบ…</p>
        : !profile ? <p className={styles.error} role="alert">{error?.message}</p>
        : <form onSubmit={submit}>
          <Field label="ชื่อ-นามสกุล" name="full_name" value={values.full_name} onChange={change} error={error} required autoComplete="name" />
          <label className={styles.field}><span>อีเมลจุฬาฯ</span><input value={profile.email} disabled /></label>
          <Field label="LINE ID" name="line_id" value={values.line_id} onChange={change} error={error} />
          <Field label="เบอร์โทรศัพท์" name="phone_number" type="tel" value={values.phone_number} onChange={change} error={error} autoComplete="tel" />
          <label className={styles.field}><span>คณะ</span><select value={values.faculty} onChange={(e) => change('faculty', e.target.value)}>
            {faculties.map((name) => <option key={name} value={name}>{name}</option>)}
            <option value="other">อื่น ๆ (โปรดระบุ)</option>
          </select>{error?.field === 'faculty' && <small className={styles.error}>{error.message}</small>}</label>
          {values.faculty === 'other' && <Field label="ระบุคณะ" name="faculty_other" value={values.faculty_other} onChange={change} error={error} required />}
          {error && !error.field && <p className={styles.error} role="alert">{error.message}</p>}
          {saved && <p className={styles.message} role="status">บันทึกโปรไฟล์แล้ว</p>}
          <div className={styles.actions}>
            <button className="btn btn--outline" type="submit" disabled={pending}>{pending ? 'กำลังบันทึก…' : 'บันทึกข้อมูล'}</button>
            <button className="btn btn--primary" type="button" onClick={signOut}>ออกจากระบบ</button>
          </div>
        </form>}
    </div>
  </section>;
}

function Field({ label, name, value, onChange, error, ...props }) {
  return <label className={styles.field}><span>{label}</span><input name={name} value={value}
    onChange={(event) => onChange(name, event.target.value)} {...props} />
    {error?.field === name && <small className={styles.error} role="alert">{error.message}</small>}
  </label>;
}
