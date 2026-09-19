export const metadata = {
  title: 'Sheek Bakri Portal Terminal',
  description: 'Automated administrative framework management tools.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-900">
      <body className="h-full text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
