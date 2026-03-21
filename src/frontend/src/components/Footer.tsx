import { Rocket } from "lucide-react";

export function Footer() {
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl">
                <span className="gradient-text">ID</span> BOOST
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              The most trusted SMM panel for Instagram growth. Pure real
              engagement, zero bots.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Instagram Followers</li>
              <li>Instagram Likes</li>
              <li>Instagram Views</li>
              <li>Instagram Comments</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Refund Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2019. Built with ❤️ using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
