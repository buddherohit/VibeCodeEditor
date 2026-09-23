export const metadata = {
  title: 'Next.js App',
  description: 'Created with VibeCode',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#121212', color: '#fff' }}>{children}</body>
    </html>
  );
}
