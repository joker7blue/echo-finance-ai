export const Footer = () => {
  return (
    <footer className="border-t border-zinc-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <p>© {new Date().getFullYear()} Echo Finance. All rights reserved.</p>
          <p>
            Built by{" "}
            <a
              href="https://github.com/joker7blue"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              @joker7blue
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
