import './globals.css'

export const metadata = {
  title: 'Smart Student Hub',
  description: 'Unified School Management System Shell',
}

export default function RootLayout({ children }) {
  return (
    <html lang="om">
      <body className="bg-brandNavy text-slate-100 selection:bg-brandGold selection:text-brandNavy">{children}</body>
    </html>
  )
}
