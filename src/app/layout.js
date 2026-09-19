import './globals.css'; // Adjust the relative pathway parameters to target your Tailwind CSS base layout styles

export const metadata = {
  title: 'Sheek Bakri Portal v2.1',
  description: 'Automated administrative framework management tools for modern scholars.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-900">
      <body className="h-full font-sans antialiased text-slate-100">
        {children}
      </body>
    </html>
  );
}
