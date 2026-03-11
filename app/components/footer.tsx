// app/components/Footer.tsx
import { Link } from "@remix-run/react";
import { Package, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Package className="w-6 h-6 text-brand-400" />
              <span className="text-lg font-bold text-white">Schulbox</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Dein Schulstart mit einem Klick. Persönlich beschriftet, sozial verpackt, stressfrei bestellt.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>Österreich</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              <li><Link to="/webshop" className="text-sm hover:text-white transition-colors duration-200">Webshop</Link></li>
              <li><Link to="/schulboxen" className="text-sm hover:text-white transition-colors duration-200">Schulboxen</Link></li>
              <li><Link to="/ueber-uns" className="text-sm hover:text-white transition-colors duration-200">Über uns</Link></li>
              <li><Link to="/kontakt" className="text-sm hover:text-white transition-colors duration-200">Kontakt</Link></li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Rechtliches</h4>
            <ul className="space-y-2.5">
              <li><Link to="/impressum" className="text-sm hover:text-white transition-colors duration-200">Impressum</Link></li>
              <li><Link to="/datenschutz" className="text-sm hover:text-white transition-colors duration-200">Datenschutz</Link></li>
              <li><Link to="/agb" className="text-sm hover:text-white transition-colors duration-200">AGB</Link></li>
              <li><Link to="/widerruf" className="text-sm hover:text-white transition-colors duration-200">Widerruf</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Kontakt</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="mailto:info@schulbox.at" className="hover:text-white transition-colors duration-200">
                  info@schulbox.at
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar - only copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Schulbox. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
