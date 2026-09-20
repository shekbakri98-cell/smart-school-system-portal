import { redirect } from 'next/navigation';

export default function LoginRedirectNode() {
  redirect('/'); // Immediately forces the browser over to the root landing interface page
}
