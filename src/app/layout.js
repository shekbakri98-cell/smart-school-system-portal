import './globals.css'; // This line forces Next.js to inject your Tailwind utility sheets!

export const metadata = {
  title: 'Sheek Bakri Portal Terminal v2.1',
  description: 'Automated administrative information engine frameworks.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-900">
      <body className="h-full bg-[#0a0f1d] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
