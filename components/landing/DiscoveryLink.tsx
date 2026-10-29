import { ArrowUpRightIcon } from './Icon';

type Props = {
  href: string;
  children: React.ReactNode;
  tone?: 'dark' | 'light';
  className?: string;
};

/** Underlined text link with the up-right arrow used throughout the design. */
export function DiscoveryLink({ href, children, tone = 'dark', className = '' }: Props) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      className={`dlink dlink--${tone} ${className}`.trim()}
      href={href}
      {...(external ? { rel: 'noopener' } : {})}
    >
      <span>{children}</span>
      <ArrowUpRightIcon />
    </a>
  );
}
