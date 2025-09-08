// app/admin/page.js
import AdminClient from './AdminClient';

export const metadata = {
  title: 'Admin Statement | Staqk',
  description: 'Weekly totals across all managed client sleeves.',
};

export default function Page() {
  return <AdminClient />;
}
