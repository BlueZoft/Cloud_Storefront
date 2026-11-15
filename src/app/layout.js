
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";



export const metadata = {
  title: "Kilmaine Kakes",
  description: "Kilmaine Kakes Bakery Products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <div className="container">


        <Navbar/>
        {children}
        <Footer/>
        </div>
        </body>
    </html>
  );
}
