import { redirect } from 'next/navigation';

// Automatically routes visitors from /login over onto your operational root domain gateway page
export default function LoginRedirectNode() {
  redirect('/');
}
